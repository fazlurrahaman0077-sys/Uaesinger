import type { Post } from "@/lib/blog";
import CoverImageField from "@/components/CoverImageField";

// Shared blog editor — used by the new and edit admin pages. The server action
// (createPost / updatePost) is passed in; edit passes an existing `post`.
export default function PostForm({
  action,
  post,
  error,
}: {
  action: (formData: FormData) => void;
  post?: Post;
  error?: string;
}) {
  const isEdit = !!post;
  return (
    <form action={action} className="flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={post.id} />}

      {error === "title" && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          A title is required.
        </p>
      )}

      <Field name="title" label="Title" required defaultValue={post?.title} placeholder="How to book a wedding singer in Dubai" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field name="slug" label="Slug" defaultValue={post?.slug} placeholder="auto from title" hint="Leave blank to auto-generate. /blog/your-slug" />
        <Field name="category" label="Category" defaultValue={post?.category ?? "Guides"} placeholder="Guides" />
      </div>

      <div className="grid sm:grid-cols-[1fr_140px] gap-4">
        <Field name="excerpt" label="Excerpt" defaultValue={post?.excerpt ?? ""} placeholder="One-line summary shown on the blog index." />
        <Field name="read_mins" label="Read mins" type="number" defaultValue={post?.read_mins ?? 4} />
      </div>

      <CoverImageField defaultUrl={post?.cover_url} />

      <label className="flex flex-col gap-1.5">
        <span className="text-[12.5px] font-semibold text-[var(--ink)]">Body</span>
        <textarea
          name="body"
          rows={16}
          defaultValue={post?.body ?? ""}
          placeholder="Write the article. Separate paragraphs with a blank line."
          className={`${inputCls} resize-y font-[var(--font-body)] leading-relaxed`}
        />
        <span className="text-[11px] text-[var(--ink-faint)]">Paragraphs are separated by a blank line.</span>
      </label>

      <label className="flex items-center gap-2.5 text-[13px] font-semibold text-[var(--ink)]">
        <input type="checkbox" name="published" defaultChecked={post ? post.published : true} className="w-4 h-4 accent-[var(--blue)]" />
        Published (unchecked = save as draft)
      </label>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="py-2.5 px-6 rounded-lg bg-[var(--blue)] text-white text-[13.5px] font-semibold hover:bg-[var(--blue-dark)] transition-all">
          {isEdit ? "Save changes" : "Create post"}
        </button>
        {isEdit && (
          <a href={`/blog/${post.slug}`} target="_blank" className="text-[13px] font-semibold text-[var(--blue-dark)] hover:underline">
            View post →
          </a>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-[var(--ink)] outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all w-full bg-white";

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  placeholder,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-[var(--blue)]">*</span>}
      </span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />
      {hint && <span className="text-[11px] text-[var(--ink-faint)]">{hint}</span>}
    </label>
  );
}
