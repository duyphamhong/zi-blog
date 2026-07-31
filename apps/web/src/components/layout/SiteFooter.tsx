import Link from 'next/link'

import type { AppDictionary } from '@/modules/platform'
import type { PublicNavigation } from '@/modules/platform'
import { FOOTER_CONTACT, getFooterCopyrightYear } from '@/modules/platform'
import {
  ArrowRightIcon,
  BookIcon,
  CopyrightIcon,
  HeadsetIcon,
  InfoIcon,
  LightningIcon,
  ShieldIcon,
} from '@/components/ui/Icons'

import { Container } from './Container'

export function SiteFooter({
  dictionary,
  navigation,
}: {
  dictionary: AppDictionary
  navigation: PublicNavigation
}) {
  const year = getFooterCopyrightYear()

  return (
    <footer className="mt-24 bg-canvas-subtle py-10 sm:py-14">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-surface shadow-card">
          <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.15fr_.8fr_1.15fr_.9fr] lg:gap-12 lg:px-14 lg:py-14">
            <section>
              <p className="text-2xl font-black tracking-tight text-brand">Zi-Blog</p>
              <p className="mt-4 max-w-sm text-sm leading-7 text-text-secondary">
                {navigation.footerText || dictionary.footer.content}
              </p>
              <div aria-hidden="true" className="mt-8 flex gap-3 text-brand">
                {[BookIcon, LightningIcon, ShieldIcon].map((Icon, index) => (
                  <span
                    className="grid size-10 place-items-center rounded-full bg-brand-soft"
                    key={index}
                  >
                    <Icon />
                  </span>
                ))}
              </div>
            </section>

            <nav aria-label={dictionary.footer.navigation}>
              <FooterHeading>{dictionary.footer.quickLinks}</FooterHeading>
              <ul className="mt-5 space-y-3">
                {navigation.footerLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      className="group flex min-h-11 items-center justify-between gap-3 rounded-control border border-border-subtle bg-canvas-subtle px-3.5 text-sm font-bold text-text-secondary transition hover:border-brand hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
                      href={link.href}
                      rel={link.openInNewTab ? 'noreferrer' : undefined}
                      target={link.openInNewTab ? '_blank' : undefined}
                    >
                      <span>{link.label}</span>
                      <ArrowRightIcon className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <section>
              <FooterHeading>{dictionary.footer.contactSupport}</FooterHeading>
              <dl className="mt-5 divide-y divide-border-subtle">
                <ContactItem
                  icon={<span className="font-black">{FOOTER_CONTACT.markers.facebook}</span>}
                >
                  <a
                    className="-mx-2 block rounded-lg px-2 py-1 transition hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    href={FOOTER_CONTACT.facebookUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="font-bold text-text-primary">
                      {dictionary.footer.facebook}
                    </span>
                    <span className="mt-0.5 block text-text-muted">
                      {FOOTER_CONTACT.facebookDisplayUrl}
                    </span>
                  </a>
                </ContactItem>
                <ContactItem
                  icon={<span className="font-black">{FOOTER_CONTACT.markers.zalo}</span>}
                >
                  <a
                    className="-mx-2 block rounded-lg px-2 py-1 transition hover:bg-brand-soft hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    href={FOOTER_CONTACT.zaloUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="font-bold text-text-primary">
                      {dictionary.footer.zalo} {FOOTER_CONTACT.zaloPhone}
                    </span>
                    <span className="mt-0.5 block text-text-muted">
                      {FOOTER_CONTACT.zaloDisplayUrl}
                    </span>
                  </a>
                </ContactItem>
                <ContactItem icon={<HeadsetIcon className="size-5" />}>
                  <span className="font-bold text-text-primary">{dictionary.footer.support}</span>{' '}
                  {FOOTER_CONTACT.supportHours}
                </ContactItem>
                {navigation.socialLinks.map((link) => (
                  <ContactItem
                    icon={<ArrowRightIcon className="size-5" />}
                    key={`${link.url}-${link.label}`}
                  >
                    <a href={link.url} rel="noreferrer" target="_blank">
                      {link.label}
                    </a>
                  </ContactItem>
                ))}
              </dl>
            </section>

            <section>
              <FooterHeading>{dictionary.footer.system}</FooterHeading>
              <dl className="mt-5 space-y-3">
                <SystemItem
                  icon={<InfoIcon className="size-5" />}
                  label={dictionary.footer.version}
                >
                  {FOOTER_CONTACT.version}
                </SystemItem>
                <SystemItem
                  icon={<CopyrightIcon className="size-5" />}
                  label={dictionary.footer.copyright}
                >
                  {FOOTER_CONTACT.copyrightHolder}
                </SystemItem>
              </dl>
            </section>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 border-t border-border-subtle px-6 py-5 text-center text-xs font-semibold text-text-muted sm:flex-row sm:gap-3">
            <ShieldIcon className="size-5 text-brand" />
            <p>
              © {year} {FOOTER_CONTACT.copyrightHolder}. {dictionary.footer.rights}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}

function FooterHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b-2 border-brand pb-2 text-sm font-black uppercase tracking-[0.12em] text-text-primary">
      {children}
    </h2>
  )
}

function ContactItem({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 text-sm leading-5 text-text-secondary first:pt-0 last:pb-0">
      <dt
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"
      >
        {icon}
      </dt>
      <dd className="min-w-0 break-words [&_a]:transition [&_a:hover]:text-brand [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-brand">
        {children}
      </dd>
    </div>
  )
}

function SystemItem({
  children,
  icon,
  label,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-canvas-subtle p-3 text-sm">
      <dt
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"
      >
        {icon}
      </dt>
      <dd className="min-w-0 break-words leading-5 text-text-secondary">
        <span className="block font-bold text-text-primary">{label}</span>
        {children}
      </dd>
    </div>
  )
}
