/**
 *  * @license
  * SPDX-License-Identifier: Apache-2.0
   */

   /**
    * Returns the localized month abbreviation for a given month index and language.
     * @param monthIndex - 0-based month index (0 = January, 11 = December)
      * @param lang - language code: 'no', 'pl', or 'en'
       */
       export function getMonthAbbr(monthIndex: number, lang: string): string {
         const months: Record<string, string[]> = {
             no: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
                 pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paz', 'lis', 'gru'],
                     en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                       };
                         const langMonths = months[lang] ?? months['en'];
                           return langMonths[monthIndex] ?? '';
                           }

                           /**
                            * Formats a date as a short localized string (e.g. "3. jun 2026").
                             * @param date - Date object or ISO date string
                              * @param lang - language code: 'no', 'pl', or 'en'
                               */
                               export function formatDateByLanguage(date: Date | string, lang: string): string {
                                 const d = typeof date === 'string' ? new Date(date) : date;
                                   const day = d.getDate();
                                     const month = getMonthAbbr(d.getMonth(), lang);
                                       const year = d.getFullYear();
                                         return `${day}. ${month} ${year}`;
                                         }
                                         