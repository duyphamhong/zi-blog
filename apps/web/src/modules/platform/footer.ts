export const FOOTER_CONTACT = {
  copyrightHolder: 'Zi Phạm - PSE',
  facebookDisplayUrl: 'PSE Fanpage',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61591802753991',
  markers: {
    copyright: '@',
    facebook: 'f',
    support: 'H',
    version: 'i',
    zalo: 'Z',
  },
  supportHours: '08:30 - 17:30',
  version: 'v1.0.0',
  zaloDisplayUrl: 'zalo.me/0935223811',
  zaloPhone: '0935 223 811',
  zaloUrl: 'https://zalo.me/0935223811',
} as const

export function getFooterCopyrightYear(date = new Date()): number {
  return date.getFullYear()
}
