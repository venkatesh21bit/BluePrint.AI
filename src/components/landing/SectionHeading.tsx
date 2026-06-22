import React from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div
      className={
        isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"
      }
    >
      <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] text-indigo-400">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-pretty text-base leading-relaxed text-neutral-400 ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
