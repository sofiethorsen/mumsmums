export function localized(sv: string, en: string | null | undefined, locale: string): string {
    return locale === 'en' && en ? en : sv
}
