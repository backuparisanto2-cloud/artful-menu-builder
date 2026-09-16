import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Image as ImageIcon,
  LogOut,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { encodeMenuImage } from "@/lib/webp-encode";
import { downloadMenuZip } from "@/lib/export-menu-zip";
import type { MenuPage } from "@/data/menu-pages";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Kelola Menu — Kantin Inyong" },
      { name: "description", content: "Kelola halaman menu: tambah, ganti, hapus, dan urutkan." },
      { property: "og:title", content: "Kelola Menu — Kantin Inyong" },
      { property: "og:description", content: "Panel pengelola halaman menu Umaeh Inyong." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Row = {
  id: string;
  position: number;
  slug: string;
  title: string;
  subtitle: string;
  image_url: string;
  storage_path: string | null;
  bytes: number;
};

function slugify(value: string, fallback: string) {
  const s = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

/** Ubah pesan teknis jadi bahasa sehari-hari. */
function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("exceeded the maximum allowed size") || m.includes("payload too large")) {
    return "Fotonya terlalu besar. Coba foto di bawah 10 MB.";
  }
  if (m.includes("row-level security") || m.includes("not authorized") || m.includes("permission")) {
    return "Akun ini tidak punya akses pengelola.";
  }
  if (m.includes("duplicate key")) {
    return "Sudah ada halaman dengan nama berkas yang sama. Ganti nama berkasnya.";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Koneksi terputus. Coba lagi sebentar.";
  }
  return message;
}

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [saved, setSaved] = useState<Record<string, { title: string; subtitle: string }>>({});
  const [version, setVersion] = useState(1);
  const [busy, setBusy] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<{ done: number; total: number } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const addInput = useRef<HTMLInputElement | null>(null);
  const replaceFor = useRef<string | null>(null);
  const replaceInput = useRef<HTMLInputElement | null>(null);
  const newestId = useRef<string | null>(null);

  const load = useCallback(async () => {
    const [pages, ver] = await Promise.all([
      supabase
        .from("menu_pages")
        .select("id, position, slug, title, subtitle, image_url, storage_path, bytes")
        .order("position", { ascending: true }),
      supabase.from("site_version").select("version").maybeSingle(),
    ]);
    if (pages.data) {
      const list = pages.data as Row[];
      setRows(list);
      setSaved(
        Object.fromEntries(list.map((r) => [r.id, { title: r.title, subtitle: r.subtitle }])),
      );
    }
    if (ver.data) setVersion(ver.data.version);
    setLoading(false);
  }, []);

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      const ok = Boolean(data);
      setIsAdmin(ok);
      if (ok) await load();
      else setLoading(false);
    })();
  }, [load]);

  const isDirty = useCallback(
    (row: Row) => {
      const base = saved[row.id];
      return !base || base.title !== row.title || base.subtitle !== row.subtitle;
    },
    [saved],
  );

  const dirtyCount = rows.filter(isDirty).length;

  // Peringatkan kalau masih ada perubahan yang belum disimpan.
  useEffect(() => {
    if (dirtyCount === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyCount]);

  // Gulirkan ke kartu yang baru ditambahkan.
  useEffect(() => {
    if (!newestId.current) return;
    const el = document.getElementById(`page-${newestId.current}`);
    newestId.current = null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.querySelector<HTMLInputElement>("input[data-title]")?.focus();
    }
  }, [rows]);

  async function uploadImage(file: File, slug: string) {
    const { blob, width, height } = await encodeMenuImage(file);
    const path = `${Date.now()}-${slug}.webp`;
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(path, blob, { contentType: "image/webp", upsert: false });
    if (error) throw new Error(error.message);
    return { path, url: `/api/public/menu-image/${path}`, width, height, bytes: blob.size };
  }

  async function onAdd(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setBusy(true);
    setUploadInfo({ done: 0, total: list.length });
    try {
      let position = rows.length;
      let lastId: string | null = null;
      for (const [index, file] of list.entries()) {
        position += 1;
        const base = slugify(file.name.replace(/\.[^.]+$/, ""), `halaman-${position}`);
        const slug = rows.some((r) => r.slug === base) ? `${base}-${position}` : base;
        const up = await uploadImage(file, slug);
        const { data, error } = await supabase
          .from("menu_pages")
          .insert({
            position,
            slug,
            title: "",
            subtitle: "",
            image_url: up.url,
            storage_path: up.path,
            width: up.width,
            height: up.height,
            bytes: up.bytes,
          })
          .select("id")
          .maybeSingle();
        if (error) throw new Error(error.message);
        lastId = data?.id ?? null;
        setUploadInfo({ done: index + 1, total: list.length });
      }
      await supabase.rpc("bump_site_version");
      newestId.current = lastId;
      await load();
      toast.success(
        list.length === 1 ? "Halaman ditambahkan. Isi judulnya." : `${list.length} halaman ditambahkan.`,
      );
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setUploadInfo(null);
      setBusy(false);
    }
  }

  async function onReplace(files: FileList | null) {
    const id = replaceFor.current;
    const file = files?.[0];
    if (!id || !file) return;
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setBusy(true);
    try {
      const up = await uploadImage(file, row.slug);
      const { error } = await supabase
        .from("menu_pages")
        .update({
          image_url: up.url,
          storage_path: up.path,
          width: up.width,
          height: up.height,
          bytes: up.bytes,
        })
        .eq("id", id);
      if (error) throw new Error(error.message);
      if (row.storage_path) await supabase.storage.from("menu-images").remove([row.storage_path]);
      await supabase.rpc("bump_site_version");
      await load();
      toast.success(`Gambar diganti (${Math.round(up.bytes / 1024)} KB).`);
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const row = pendingDelete;
    setPendingDelete(null);
    if (!row) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("menu_pages").delete().eq("id", row.id);
      if (error) throw new Error(error.message);
      if (row.storage_path) await supabase.storage.from("menu-images").remove([row.storage_path]);
      const rest = rows.filter((r) => r.id !== row.id);
      await supabase.rpc("reorder_menu_pages", { _ids: rest.map((r) => r.id) });
      await load();
      toast.success("Halaman dihapus dan nomor halaman diperbarui.");
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  /** Tukar posisi lalu langsung simpan urutannya. */
  async function move(index: number, dir: number) {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const copy = [...rows];
    const a = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = a;
    setRows(copy);
    setBusy(true);
    try {
      const { error } = await supabase.rpc("reorder_menu_pages", { _ids: copy.map((r) => r.id) });
      if (error) throw new Error(error.message);
      toast.success("Urutan disimpan.");
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveRow(row: Row) {
    setSavingId(row.id);
    try {
      const { error } = await supabase
        .from("menu_pages")
        .update({ title: row.title, subtitle: row.subtitle })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      await supabase.rpc("bump_site_version");
      setSaved((s) => ({ ...s, [row.id]: { title: row.title, subtitle: row.subtitle } }));
      setVersion((v) => v + 1);
      toast.success("Perubahan halaman disimpan.");
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setSavingId(null);
    }
  }

  async function onSaveAll() {
    const dirty = rows.filter(isDirty);
    if (!dirty.length) {
      toast.info("Tidak ada perubahan yang perlu disimpan.");
      return;
    }
    setBusy(true);
    try {
      for (const row of dirty) {
        const { error } = await supabase
          .from("menu_pages")
          .update({ title: row.title, subtitle: row.subtitle })
          .eq("id", row.id);
        if (error) throw new Error(error.message);
      }
      const { error: rpcError } = await supabase.rpc("reorder_menu_pages", {
        _ids: rows.map((r) => r.id),
      });
      if (rpcError) throw new Error(rpcError.message);
      await load();
      toast.success(`${dirty.length} halaman disimpan.`);
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function onZip() {
    setBusy(true);
    try {
      const pages: MenuPage[] = rows.map((r) => ({
        id: r.slug,
        title: r.title,
        subtitle: r.subtitle,
        url: r.image_url,
      }));
      await downloadMenuZip(pages, version);
      toast.success(`ZIP versi ${version} diunduh.`);
    } catch (err) {
      toast.error(friendlyError((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#faf5ea] px-6 text-center">
        <p className="text-sm text-[#5a3521]">Akun ini tidak punya akses pengelola.</p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-full bg-[#5a3521] px-4 py-2 text-xs font-semibold text-[#faf5ea]"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5ea] pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-[#5a3521]/15 bg-[#faf5ea]/95 px-4 py-3 backdrop-blur">
        <div>
          <h1 className="text-base font-bold text-[#5a3521]">Kelola Menu</h1>
          <p className="text-xs text-[#5a3521]/70">
            {loading ? "Memuat…" : `${rows.length} halaman · versi build ${version}`}
            {dirtyCount > 0 && ` · ${dirtyCount} belum disimpan`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Keluar"
          className="rounded-full bg-[#5a3521]/10 p-2 text-[#5a3521]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => addInput.current?.click()}
            className="flex items-center gap-1.5 rounded-full bg-[#7ba428] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Tambah halaman
          </button>
          <button
            type="button"
            disabled={busy || dirtyCount === 0}
            onClick={() => void onSaveAll()}
            className="flex items-center gap-1.5 rounded-full bg-[#5a3521] px-4 py-2 text-xs font-semibold text-[#faf5ea] disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Simpan semua{dirtyCount > 0 ? ` (${dirtyCount})` : ""}
          </button>
          <button
            type="button"
            disabled={busy || rows.length === 0}
            onClick={() => void onZip()}
            className="flex items-center gap-1.5 rounded-full bg-[#5a3521]/10 px-4 py-2 text-xs font-semibold text-[#5a3521] disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> Unduh ZIP statis
          </button>
        </div>

        <input
          ref={addInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void onAdd(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={replaceInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void onReplace(e.target.files);
            e.target.value = "";
          }}
        />

        {uploadInfo && (
          <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-[#5a3521] shadow-sm">
            Mengunggah {uploadInfo.done} dari {uploadInfo.total} foto…
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#5a3521]/10">
              <div
                className="h-full rounded-full bg-[#7ba428] transition-all"
                style={{ width: `${(uploadInfo.done / uploadInfo.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <ul className="mt-4 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <Skeleton className="h-24 w-[68px] shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-7 w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#5a3521]/25 bg-white px-6 py-10 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-[#5a3521]/40" />
            <h2 className="mt-3 text-sm font-bold text-[#5a3521]">Belum ada halaman menu</h2>
            <p className="mx-auto mt-1 max-w-xs text-xs text-[#5a3521]/70">
              Unggah foto halaman menu Anda. Fotonya otomatis dikecilkan supaya cepat dibuka
              pelanggan.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => addInput.current?.click()}
              className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-[#7ba428] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Tambah halaman
            </button>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {rows.map((row, i) => {
              const dirty = isDirty(row);
              return (
                <li
                  key={row.id}
                  id={`page-${row.id}`}
                  className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ${dirty ? "ring-2 ring-[#e6a817]/60" : ""}`}
                >
                  <img
                    src={row.image_url}
                    alt={row.title || `Halaman ${i + 1}`}
                    className="h-24 w-[68px] shrink-0 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-[#7ba428]">Halaman {i + 1}</p>
                      {dirty && (
                        <span className="rounded-full bg-[#e6a817]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8a6100]">
                          belum disimpan
                        </span>
                      )}
                    </div>
                    <input
                      data-title
                      value={row.title}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((r) => (r.id === row.id ? { ...r, title: e.target.value } : r)),
                        )
                      }
                      placeholder="Judul halaman"
                      className="mt-1 w-full rounded-md border border-[#5a3521]/15 px-2 py-1.5 text-sm font-semibold text-[#5a3521]"
                    />
                    <input
                      value={row.subtitle}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((r) => (r.id === row.id ? { ...r, subtitle: e.target.value } : r)),
                        )
                      }
                      placeholder="Keterangan"
                      className="mt-1.5 w-full rounded-md border border-[#5a3521]/15 px-2 py-1.5 text-xs text-[#5a3521]"
                    />
                    <p className="mt-1 text-[11px] text-[#5a3521]/60">
                      {Math.round(row.bytes / 1024) || "?"} KB · {row.slug}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={busy || savingId === row.id || !dirty}
                        onClick={() => void saveRow(row)}
                        className="flex items-center gap-1 rounded-full bg-[#5a3521] px-3 py-1.5 text-[11px] font-semibold text-[#faf5ea] disabled:opacity-40"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingId === row.id ? "Menyimpan…" : "Simpan"}
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() => void move(i, -1)}
                        aria-label="Naikkan urutan"
                        className="rounded-full bg-[#5a3521]/10 p-1.5 text-[#5a3521] disabled:opacity-40"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === rows.length - 1}
                        onClick={() => void move(i, 1)}
                        aria-label="Turunkan urutan"
                        className="rounded-full bg-[#5a3521]/10 p-1.5 text-[#5a3521] disabled:opacity-40"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          replaceFor.current = row.id;
                          replaceInput.current?.click();
                        }}
                        className="flex items-center gap-1 rounded-full bg-[#5a3521]/10 px-3 py-1.5 text-[11px] font-semibold text-[#5a3521] disabled:opacity-40"
                      >
                        <ImageIcon className="h-3.5 w-3.5" /> Ganti gambar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setPendingDelete(row)}
                        className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus halaman "{pendingDelete?.title || "tanpa judul"}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Fotonya juga akan terhapus dan tidak bisa dikembalikan. Nomor halaman lainnya otomatis
              disusun ulang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
