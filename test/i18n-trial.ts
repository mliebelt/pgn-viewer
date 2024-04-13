import { i18n } from 'typesafe-i18n'

type Locales = 'en' | 'de' | 'it'

const localeTranslations = {
    en: { TODAY: 'Today is {date|weekday}' },
    de: { TODAY: 'Heute ist {date|weekday}' },
    it: { TODAY: 'Oggi è {date|weekday}' },
}

const initFormatters = (locale: Locales) => {
    const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })

    return {
        weekday: (value: Date | number) => dateFormatter.format(value),
    }
}

const formatters = {
    en: initFormatters('en'),
    de: initFormatters('de'),
    it: initFormatters('it'),
}

const L = i18n(localeTranslations, formatters)

const now = new Date()

// console.log(L.en.TODAY({ date: now })) // => 'Today is friday'
// console.log(L.de.TODAY({ date: now })) // => 'Heute ist Freitag'
// console.log(L.it.TODAY({ date: now })) // => 'Oggi è venerdì'