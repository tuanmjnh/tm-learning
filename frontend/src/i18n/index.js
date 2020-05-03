import Cookies from 'js-cookie'
import region from './region'
import viVN from './vi-VN'
import enUS from './en-US'

export const messages = {
  'vi-VN': viVN,
  'en-US': enUS
}
export function Get() {
  const chooseLanguage = Cookies.get('language')
  if (chooseLanguage) return chooseLanguage

  // if has not choose language
  const language = (navigator.language || navigator.browserLanguage).toLowerCase()
  const locales = Object.keys(messages)
  for (const locale of locales) {
    if (language.indexOf(locale) > -1) {
      return locale
    }
  }
  return 'vi-VN'
}

export function Set(language) {
  Cookies.set('language', language)
}

export function GetAll() {
  const locales = Object.keys(messages)
  return region.filter(x => locales.indexOf(`${x.cc_iso}-${x.cc}`) > -1)
}

export default messages
