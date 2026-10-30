/**
 * Substack newsletter signup for the footer.
 *
 * Rendered as a plain iframe instead of the old Ghost signup script, so this
 * stays a server component and ships no client JavaScript. It is lazy-loaded
 * because the footer sits at the bottom of every marketing page — Substack is
 * only requested once the visitor scrolls near it.
 */
export function FooterSubscribe() {
  return (
    <div className="mx-auto w-full max-w-[480px]">
      <iframe
        src="https://writebysachin.substack.com/embed"
        title="Subscribe to the Yoga Write Code newsletter"
        width="480"
        height="320"
        loading="lazy"
        scrolling="no"
        className="h-[320px] w-full rounded-xl border border-line bg-white"
      />
    </div>
  );
}
