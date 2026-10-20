import { useEffect, useRef } from "react";
import { AlertTriangle, Link2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "./DashboardPrimitives";

const useDialogLifecycle = (open, onClose, focusRef) => {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const timer = window.setTimeout(() => focusRef.current?.focus(), 0);
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [focusRef, onClose, open]);
};

export const EditLinkDialog = ({ link, onClose, onSave, saving, error }) => {
  const firstInput = useRef(null);
  useDialogLifecycle(Boolean(link), onClose, firstInput);
  if (!link) return null;

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const alias = form.get("alias")?.toString().trim() || "";
    const payload = {
      url: form.get("url")?.toString().trim(),
      title: form.get("title")?.toString().trim(),
    };
    if (alias !== (link.alias || "")) payload.alias = alias;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-(--primary-text)/40 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="edit-link-title" className="dashboard-scrollbar max-h-[calc(100dvh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--secondary)/65 text-(--primary-deep)"><Pencil className="h-5 w-5" /></span><div><h2 id="edit-link-title" className="font-bold text-(--primary-text)">Edit short link</h2><p className="mt-1 text-sm text-(--secondary-text)">Update the destination, title, or short alias.</p></div></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close edit dialog" className="focus-ring inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) hover:bg-(--surface-soft) disabled:opacity-50"><X className="h-5 w-5" /></button></div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label htmlFor="edit-url" className="mb-2 block text-sm font-semibold">Destination URL</label><input ref={firstInput} id="edit-url" name="url" type="url" required defaultValue={link.redirectUrl} className="focus-ring min-h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm" /></div>
          <div><label htmlFor="edit-title" className="mb-2 block text-sm font-semibold">Title <span className="font-normal text-(--secondary-text)">(optional)</span></label><input id="edit-title" name="title" maxLength="120" defaultValue={link.title || ""} className="focus-ring min-h-11 w-full rounded-xl border border-(--border) bg-(--surface) px-3.5 text-sm" /></div>
          <div><label htmlFor="edit-alias" className="mb-2 block text-sm font-semibold">Custom alias <span className="font-normal text-(--secondary-text)">(optional)</span></label><div className="flex items-center rounded-xl border border-(--border) bg-(--surface) focus-within:ring-2 focus-within:ring-(--primary)/35"><span className="border-r border-(--border) px-3 text-xs text-(--secondary-text)"><Link2 className="h-4 w-4" /></span><input id="edit-alias" name="alias" minLength="3" maxLength="32" pattern="[A-Za-z0-9_-]{3,32}" defaultValue={link.alias || ""} placeholder={link.shortID} className="min-h-11 min-w-0 flex-1 rounded-r-xl bg-transparent px-3.5 text-sm outline-none" /></div><p className="mt-1.5 text-xs text-(--secondary-text)">Clearing a custom alias generates a new random short ID.</p></div>
          {error && <p role="alert" className="rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-(--danger)">{error}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-(--border) pt-4 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button></div>
        </form>
      </div>
    </div>
  );
};

export const DeleteLinkDialog = ({ link, onClose, onConfirm, deleting, error }) => {
  const cancelRef = useRef(null);
  useDialogLifecycle(Boolean(link), onClose, cancelRef);
  if (!link) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-(--primary-text)/40 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !deleting && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="delete-link-title" aria-describedby="delete-link-description" className="w-full max-w-md rounded-2xl border border-(--border) bg-(--surface) p-5 shadow-2xl sm:p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8e9e5] text-(--danger)"><AlertTriangle className="h-5 w-5" /></span>
        <h2 id="delete-link-title" className="mt-4 text-lg font-bold">Delete this short link?</h2>
        <p id="delete-link-description" className="mt-2 text-sm leading-6 text-(--secondary-text)"><strong className="text-(--primary-text)">{link.title || link.shortID}</strong> and its recorded analytics will be permanently removed. This cannot be undone.</p>
        {error && <p role="alert" className="mt-4 rounded-xl border border-[#d9a79b] bg-[#f8e9e5] px-4 py-3 text-sm text-(--danger)">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={deleting}>Cancel</Button><button type="button" onClick={onConfirm} disabled={deleting} className="focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--danger) px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 className="h-4 w-4" />{deleting ? "Deleting…" : "Delete link"}</button></div>
      </div>
    </div>
  );
};
