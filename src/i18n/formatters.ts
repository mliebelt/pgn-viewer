import type { FormattersInitializer } from 'typesafe-i18n'
import type { Formatters } from './i18n-types'
import {SupportedLocales} from "../types";

export const initFormatters: FormattersInitializer<SupportedLocales, Formatters> = (locale: SupportedLocales) => {

	const formatters: Formatters = {
		// add your formatter functions here
	}

	return formatters
}
