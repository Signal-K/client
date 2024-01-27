import Document, { Html, Head, Main, NextScript } from 'next/document'

const APP_NAME = 'Star Sailors'
const APP_DESCRIPTION = 'Star Sailors'

class _Document extends Document {
  static async getInitialProps(ctx) {
    return await Document.getInitialProps(ctx)
  }

  render() {
    return (
      <Html lang='en' dir='ltr'>
        <Head>
          <meta name='application-name' content={APP_NAME} />
          <meta name='apple-mobile-web-app-capable' content='yes' />
          <meta name='apple-mobile-web-app-status-bar-style' content='default' />
          <meta name='apple-mobile-web-app-title' content={APP_NAME} />
          <meta name='description' content={APP_DESCRIPTION} />
          <meta name='format-detection' content='telephone=no' />
          <meta name='mobile-web-app-capable' content='yes' />
          <meta name='theme-color' content='#FFFFFF' />
          {/* TIP: set viewport head meta tag in _app.js, otherwise it will show a warning */}
          {/* <meta name='viewport' content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover' /> */}

          <link rel='apple-touch-icon' sizes='180x180' href='https://cdn.cloud.scenario.com/assets/VFF4bSNWSqqsJFrcS8-X9A?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9WRkY0YlNOV1NxcXNKRnJjUzgtWDlBP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcwOTg1NTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FQKQ-UEuzxBmJ15OI8kdjqRQf~3Eb40E-whumwnM4bXjfibv3YQ9HJWQNM75Z12OBiGfEcMd4O3izAt09oHaGI7d8QZ3pHPHCVqqDiU5ZwXGULQPGNANUd0fpSkotEjNAGTCO-Oq4mmkHLMAkmAf2PRqz5Sdh-rPVYi3n694KnvD7YB8kSySI5O40c7P8GTA5Gp0Y59FTWwpFxXH1NVZFgRd33WqdUTwwqrj-YjsmHem2r8LF78bqTFhrGTKU906p8sSVa~V3ma~PLvlJI2l4CqjbUhdc1lyv85hGSq1qVZrs-SkTdfeU7C7X-g3ww5NNWJ2XV0IHLM7zktAYP3ICQ__' />
          <link rel='manifest' href='/manifest.json' />
          <link rel='shortcut icon' href='https://cdn.cloud.scenario.com/assets/VFF4bSNWSqqsJFrcS8-X9A?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9WRkY0YlNOV1NxcXNKRnJjUzgtWDlBP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcwOTg1NTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FQKQ-UEuzxBmJ15OI8kdjqRQf~3Eb40E-whumwnM4bXjfibv3YQ9HJWQNM75Z12OBiGfEcMd4O3izAt09oHaGI7d8QZ3pHPHCVqqDiU5ZwXGULQPGNANUd0fpSkotEjNAGTCO-Oq4mmkHLMAkmAf2PRqz5Sdh-rPVYi3n694KnvD7YB8kSySI5O40c7P8GTA5Gp0Y59FTWwpFxXH1NVZFgRd33WqdUTwwqrj-YjsmHem2r8LF78bqTFhrGTKU906p8sSVa~V3ma~PLvlJI2l4CqjbUhdc1lyv85hGSq1qVZrs-SkTdfeU7C7X-g3ww5NNWJ2XV0IHLM7zktAYP3ICQ__' />
          <style>{`
            html, body, #__next {
              height: 100%;
            }
            #__next {
              margin: 0 auto;
            }
            h1 {
              text-align: center;
            }
            `}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default _Document
