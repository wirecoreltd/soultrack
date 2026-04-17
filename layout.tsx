import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function LocaleLayout({children, params}) {
  const {locale} = params;

  let messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <PublicHeader />
        <header className="relative">
          <LanguageSwitcher />
        </header>

        {children}
      </body>
    </html>
  );
}
