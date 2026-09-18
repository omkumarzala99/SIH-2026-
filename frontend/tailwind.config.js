/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Professional Cool Blue / Blue-Grey Industrial Palette ──────────────
        cs: {
          canvas:    '#EEF5F9',  // main workspace page background
          sidebar:   '#F4F9FC',  // left sidebar background
          header:    '#F8FBFD',  // top header background
          card:      '#FFFFFF',  // primary card surface
          raised:    '#FFFFFF',  // raised card surface
          toolbar:   '#F4F9FC',  // secondary toolbar / section background
          nested:    '#F4F9FC',  // inner section container
          border:    '#D5E3ED',  // thin border
          hover:     '#E1F1FA',  // hover / active highlight
          text:      '#123B63',  // primary text (dark blue/navy)
          sub:       '#55738F',  // secondary text (blue-grey)
          muted:     '#7890A0',  // muted text / metadata labels
        },
        amber: {
          DEFAULT:   '#E5A000',  // MOIL amber
          hover:     '#C78B00',  // hover
          active:    '#AA7600',  // pressed
          light:     '#FEF6E5',  // amber tinted background
        },
        blue: {
          primary:   '#1677B8',  // primary blue
          light:     '#E1F1FA',  // light blue highlight
        },
        sidebar: {
          bg:        '#F4F9FC',  // sidebar background
          active:    '#E1F1FA',  // active nav background
        },
        success: {
          DEFAULT:   '#159A78',
          light:     '#E6F4EF',
        },
        warn: {
          DEFAULT:   '#D99000',
          light:     '#FDF0D9',
        },
        danger: {
          DEFAULT:   '#D94B4B',
          light:     '#FAEAEA',
        },
        info: {
          DEFAULT:   '#1677B8',
          light:     '#E1F1FA',
        },
        geo: {
          DEFAULT:   '#1677B8',
          light:     '#E1F1FA',
        },
        // ── Legacy aliases mapped to exact Cool Blue-Grey Industrial tokens ────
        steel: {
          bg:        '#EEF5F9',
          surface:   '#F8FBFD',
          secondary: '#F4F9FC',
          card:      '#FFFFFF',
          border:    '#D5E3ED',
          text:      '#123B63',
          sub:       '#55738F',
          muted:     '#7890A0',
        },
        moil: {
          amber:      '#E5A000',
          amberLight: '#FEF6E5',
          amberHover: '#C78B00',
        },
        ops: {
          success:       '#159A78',
          successLight:  '#E6F4EF',
          warning:       '#D99000',
          warningLight:  '#FDF0D9',
          critical:      '#D94B4B',
          criticalLight: '#FAEAEA',
          blue:          '#1677B8',
          blueLight:     '#E1F1FA',
        },
        industrial: {
          bg:        '#EEF5F9',
          card:      '#FFFFFF',
          surface:   '#F4F9FC',
          border:    '#D5E3ED',
          text:      '#123B63',
          secondary: '#55738F',
          muted:     '#7890A0',
          amber:     '#E5A000',
          amberHover:'#C78B00',
          positive:  '#159A78',
          warning:   '#D99000',
          critical:  '#D94B4B',
          blue:      '#1677B8',
        },
        mining: {
          950: '#0b0f19',
          900: '#0f172a',
          850: '#151f38',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          amber:   '#E5A000',
          gold:    '#eab308',
          teal:    '#06b6d4',
          emerald: '#159A78',
          danger:  '#D94B4B',
        }
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(18, 59, 99, 0.05)',
        'card-md': '0 2px 6px rgba(18, 59, 99, 0.07)',
        'drawer':  '0 8px 28px rgba(18, 59, 99, 0.12)',
        'inner-sm':'inset 0 1px 2px rgba(18, 59, 99, 0.04)',
        // legacy
        'industrial':    '0 1px 3px rgba(18, 59, 99, 0.05)',
        'industrial-md': '0 2px 6px rgba(18, 59, 99, 0.07)',
      },
      borderRadius: {
        industrial: '8px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      }
    },
  },
  plugins: [],
}
