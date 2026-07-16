import type { Metadata } from "next";
import Link from "next/link";
import { resume } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume of Brody Berson: Forward Deployed Engineer at Ravenna, previously Sr. Partner Solution Engineer (AI) on Zapier's MCP team.",
};

function dateRange(start: string, end: string) {
  return end ? `${start} – ${end}` : start;
}

export default function ResumePage() {
  return (
    <>
      <header className="border-b border-line/60 bg-paper/85 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-sm text-ink-soft transition-colors hover:text-blue-ink"
          >
            ← brodyberson.com
          </Link>
          <a
            href="/brody-berson-resume.pdf"
            download
            className="rounded-lg bg-blue-deep px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-ink"
          >
            Download PDF
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14 print:max-w-none print:p-0">
        <article className="rounded-2xl border border-line bg-white/60 p-7 sm:p-12 print:rounded-none print:border-0 print:bg-white print:p-0">
          {/* Header */}
          <header>
            <h1 className="font-display text-4xl font-semibold tracking-tight print:text-3xl">
              {resume.basics.name}
            </h1>
            <p className="mt-2 text-lg text-ink-soft print:text-base">{resume.basics.label}</p>
            <p className="mt-3 font-mono text-xs text-ink-faint">
              {resume.basics.location} · <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a> ·{" "}
              <a href={resume.basics.url}>brodyberson.com</a>
            </p>
          </header>

          <p className="mt-6 border-l-2 border-butter pl-4 text-sm leading-relaxed text-ink-soft print:mt-4">
            {resume.basics.summary}
          </p>

          {/* Work */}
          <section className="mt-10 print:mt-6">
            <h2 className="font-mono text-xs font-semibold tracking-widest text-blue-ink uppercase">
              Work experience
            </h2>
            <div className="mt-4 space-y-7 print:space-y-4">
              {resume.work.map((job) => (
                <div key={`${job.company}-${job.startDate}`} className="print:break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <h3 className="font-medium">
                      {job.position} <span className="text-ink-faint">·</span>{" "}
                      {job.url ? (
                        <a
                          href={job.url}
                          className="underline decoration-blue/30 underline-offset-4 transition-colors hover:text-blue-ink hover:decoration-blue print:no-underline"
                        >
                          {job.company}
                        </a>
                      ) : (
                        job.company
                      )}
                      {job.note ? (
                        <span className="ml-2 rounded-full bg-butter-soft px-2 py-0.5 align-middle text-xs font-normal text-ink-soft print:border print:border-line">
                          {job.note}
                        </span>
                      ) : null}
                    </h3>
                    <span className="font-mono text-xs text-ink-faint">
                      {dateRange(job.startDate, job.endDate)}
                      {job.location ? ` · ${job.location}` : ""}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5 print:space-y-1">
                    {job.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
                      >
                        <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-blue/60 print:bg-ink-soft" aria-hidden />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="mt-10 print:mt-6 print:break-inside-avoid">
            <h2 className="font-mono text-xs font-semibold tracking-widest text-blue-ink uppercase">
              Projects
            </h2>
            <div className="mt-4 space-y-4 print:space-y-2.5">
              {resume.projects.map((project) => (
                <div key={project.name}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-medium">{project.name}</h3>
                    {project.year ? (
                      <span className="font-mono text-xs text-ink-faint">{project.year}</span>
                    ) : null}
                    {project.tag ? (
                      <span className="rounded-full bg-butter-soft px-2 py-0.5 text-xs text-ink-soft print:border print:border-line">
                        {project.tag}
                      </span>
                    ) : null}
                    {project.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        className="text-xs font-medium text-blue-ink underline decoration-blue/40 underline-offset-4 hover:decoration-blue print:no-underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{project.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Education + Skills */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 print:mt-6 print:break-inside-avoid">
            <section>
              <h2 className="font-mono text-xs font-semibold tracking-widest text-blue-ink uppercase">
                Education
              </h2>
              {resume.education.map((edu) => (
                <div key={edu.institution} className="mt-4">
                  <h3 className="font-medium">
                    {edu.url ? (
                      <a
                        href={edu.url}
                        className="underline decoration-blue/30 underline-offset-4 transition-colors hover:text-blue-ink hover:decoration-blue print:no-underline"
                      >
                        {edu.institution}
                      </a>
                    ) : (
                      edu.institution
                    )}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {edu.studyType}, {edu.area}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink-faint">
                    {edu.startDate} – {edu.endDate}
                  </p>
                </div>
              ))}
            </section>
            <section>
              <h2 className="font-mono text-xs font-semibold tracking-widest text-blue-ink uppercase">
                Skills
              </h2>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {resume.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-ink-soft print:bg-white"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>

        <p className="mt-6 text-center font-mono text-xs text-ink-faint print:hidden">
          Agents can fetch this as JSON via the{" "}
          <Link href="/#mcp" className="underline underline-offset-4 hover:text-blue-ink">
            MCP server
          </Link>{" "}
          or as markdown at{" "}
          <a href="/resume.md" className="underline underline-offset-4 hover:text-blue-ink">
            /resume.md
          </a>
          .
        </p>
      </main>
    </>
  );
}
