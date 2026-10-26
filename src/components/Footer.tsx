import { company } from "@/config/company";
import { RoofMark } from "@/components/Header";

export function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="/" className="flex items-center gap-2.5">
            <RoofMark />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold uppercase tracking-wide">
                {company.shortName}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-steel-2">
                Roofing Co.
              </span>
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel-2">{company.footer.blurb}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-steel-2">
            Est. {company.founded} · {company.license}
          </p>
        </div>

        <div>
          <p className="overline-label text-accent">Services</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {company.services.map((s) => (
              <li key={s.id}>
                <a href="#services" className="text-steel-2 transition-colors hover:text-accent">
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <a href="/checkout/roof-inspection-149" className="text-steel-2 hover:text-accent">
                Book an inspection online
              </a>
            </li>
            <li>
              <a href="/checkout/storm-response-1250" className="text-steel-2 hover:text-accent">
                24/7 storm response
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="overline-label text-accent">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href="#process" className="text-steel-2 hover:text-accent">How it works</a></li>
            <li><a href="#area" className="text-steel-2 hover:text-accent">Service area</a></li>
            <li><a href="#financing" className="text-steel-2 hover:text-accent">Financing</a></li>
            <li><a href="#reviews" className="text-steel-2 hover:text-accent">Reviews</a></li>
            <li><a href="#pricing" className="text-steel-2 hover:text-accent">Pricing & plans</a></li>
            <li><a href="/dashboard" className="text-steel-2 hover:text-accent">Owner dashboard</a></li>
          </ul>
        </div>

        <div>
          <p className="overline-label text-accent">Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm text-steel-2">
            <li>
              <a href={company.phoneHref} className="font-semibold text-cream hover:text-accent">
                {company.phone}
              </a>
            </li>
            <li>
              Storm line 24/7:{" "}
              <a href="tel:+15125550199" className="font-semibold text-accent">
                {company.emergencyPhone}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="hover:text-accent">
                {company.email}
              </a>
            </li>
            <li>{company.address}</li>
            <li className="pt-2 text-xs uppercase tracking-wider">{company.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-[11px] uppercase tracking-wider text-steel-2 sm:px-6">
          <p>
            © {new Date().getFullYear()} {company.legalName} · All rights reserved
          </p>
          <p className="flex items-center gap-2">
            <span className="text-cream/70">Built on</span>
            <span className="border border-cream/25 px-2 py-0.5 font-display font-bold tracking-widest text-cream">
              WHOP WEBSITES
            </span>
            <span className="hidden sm:inline">Payments · Leads · Invoices · Pixel</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
