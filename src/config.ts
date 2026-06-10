/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isDemoMode } from './lib/supabase';

export const appConfig: { demoMode: boolean } = {
  demoMode: isDemoMode(),
};
