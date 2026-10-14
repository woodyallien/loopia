import { useApp } from '../context/AppContext'
import { pick } from './i18n'

export function useTr() {
  const { language } = useApp()
  return (es: string, en: string) => pick(language, es, en)
}
