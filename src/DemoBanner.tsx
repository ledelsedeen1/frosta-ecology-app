/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { appConfig } from './config';

/**
 * DemoBanner — shows a trilingual test/demo warning fixed at the top of the page.
 * Controlled by appConfig.demoMode:
 *   true  → banner is visible
 *   false → banner is hidden
 */
export function DemoBanner(): React.ReactElement | null {
  if (!appConfig.demoMode) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#fef3c7',
        borderBottom: '2px solid #f59e0b',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#78350f',
        lineHeight: '1.6',
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
      role="alert"
      aria-live="polite"
    >
      <span style={{ display: 'inline-block', marginRight: '8px' }}>&#x1F514;</span>
      <strong>Testversjon</strong>
      {' \u2014 '}
      ikke legg inn ekte personopplysninger, betalingskvitteringer eller private bilder.
      {' \u00A0\u00A0 '}
      <strong>Wersja testowa</strong>
      {' \u2014 '}
      nie wpisuj prawdziwych danych osobowych, potwierdzeń płatności ani prywatnych zdjęć.
      {' \u00A0\u00A0 '}
      <strong>Test version</strong>
      {' \u2014 '}
      do not enter real personal data, payment receipts or private photos.
    </div>
  );
}
