export const HTMLEmail = (data: {
  boldSlot1: string;
  textSlot1: string;
  boldSlot2: string;
  textSlot2: string;
  linkSlot1: string;
  linkSlot1Text: string;
  textSlot3: string;
  linkSlot2: string;
  linkSlot2Text: string;
  linkSlot3Text: string;
  linkSlot3: string;
}) => {
  return `
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Token4Good</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&family=Squada+One&display=swap');
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url("https://db.onlinewebfonts.com/t/32475be7e7241b887c54d2aee5876af0.woff2") format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
    </style>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; background-color: #ffffff; margin: 0;">
  <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
    <tr>
      <td align="center" valign="top">
        <table border="0" cellpadding="20" cellspacing="0" id="emailContainer" style="background-color: #ffffff; border-radius: 8px;max-width: 700px;">
          <tr>
            <td align="center" valign="top">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="padding: 20px 0px; font-size: 18px;  color: #000;">
                    <a href="https://www.token-for-good.com" target="_blank" style="text-align: left; margin-bottom: 18px; display: flex; justify-content: center;">
                      <img style="width:150px;" src="https://app.token-for-good.com/assets/images/png/T4G.png" alt="Token For Good" />
                    </a>
                    <h2 style="font-family: 'Squada One', cursive;font-weight: 400;font-size: 40px;line-height: 48px; color: #372986; margin-top: 100px;">Mentoring Session</h1>
                    <span>
                      <b>${data.boldSlot1 ?? ""}</b>
                    </span>
                    <span>${data.textSlot1 ?? ""}</span>
                    <b>${data.boldSlot2 ?? ""}</b>
                    <span>${data.textSlot2 ?? ""}
                      <a href="${
                        data.linkSlot2 ?? "#"
                      }" target="_blank" style="font-size: 18px; color: #000; text-decoration: underline">
                      ${data.linkSlot2Text ?? ""}
                      </a>
                    </span>
                    <span>${data.textSlot3 ?? ""}</span>
                    <a href="${
                      data.linkSlot3 ?? "#"
                    }" target="_blank" style="font-size: 18px; color:#000; text-decoration: underline">
                      ${data.linkSlot3Text ?? ""}
                    </a>
                  </td>
                </tr>
                
                ${
                  data.linkSlot1Text != ""
                    ? `
                <tr>
                  <td align="left" style="padding: 30px 0; display: flex; justify-content: center;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left"  bgcolor="#4F2FD3">
                          <a href="${
                            data.linkSlot1 ?? "#"
                          }" target="_blank" style="font-size: 18px; color: #ffffff; text-decoration: none; padding: 20px 20px; font-family: 'Squada One', cursive;
                          border: 1px solid #372986; display: inline-block;">
                            ${data.linkSlot1Text ?? ""}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ""
                }
                <tr>
                  <td align="left" style="padding-top: 20px; font-size: 16px; color: #000;">
                    À très vite,  <br />
                    <a href="https://www.token-for-good.com" target="_blank" style="margin-bottom:40px ; font-size:16px; color: #000; display:inline-block;font-weight: 700; overflow: hidden; text-overflow: ellipsis;">
                    L'équipe Token for Good
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <div style="display: flex; justify-content: center; flex-direction: column; gap: 1rem;padding: 1rem;background-color: #E5E6E8;">
    <div style="display: flex; justify-content: center;gap: 1rem;">
      <a href="https://www.linkedin.com/company/token-for-good/" target="_blank" class="res">
        <div class="lgres linkedin"></div>
      </a>
      <a href="https://www.instagram.com/tokenforgood_t4g/" target="_blank" class="res">
        <div class="lgres instagram"></div>
      </a>
      <a href="https://twitter.com/TokenforGood" target="_blank" class="res">
        <div class="lgres twitter"></div>
      </a>
      <a href="https://www.youtube.com/@tokenforgood" target="_blank" class="res">
        <div class="lgres youtube"></div>
      </a>
      <a href="https://discord.gg/5fdrNzUKjy" target="_blank" class="res">
        <div class="lgres discord"></div>
      </a>
    </div>
    <div style="display: flex; justify-content: center; text-align: center; font-size: 14px; line-height: 20px;">
      Token for Good <br>
      8 RTE DE LA JONELIERE, 44300, Nantes
    </div>
  </div>
  
  
  <style>
    .res{
      height: 40px;width: 40px;display: flex;justify-content: center;align-items: center;background-color: #A0A6FF;
    }
    .lgres::before {
      --icon-size: 1.5rem;
     background-color: #E5E6E8;
     content: "";
     display: inline-flex;
     flex: 0 0 auto;
     height: var(--icon-size);
     margin-left: 0;
     margin-right: 0;
     -webkit-mask-size: 100% 100%;
     mask-size: 100% 100%;
     vertical-align: calc(.375em - var(--icon-size)*.5);
     transition:all .2s ease-in-out;
     width: var(--icon-size);
   }
   .linkedin::before{
    -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTE4LjMzNSAxOC4zMzlIMTUuNjd2LTQuMTc3YzAtLjk5Ni0uMDItMi4yNzgtMS4zOS0yLjI3OC0xLjM4OSAwLTEuNjAxIDEuMDg0LTEuNjAxIDIuMjA1djQuMjVoLTIuNjY2VjkuNzVoMi41NnYxLjE3aC4wMzVjLjM1OC0uNjc0IDEuMjI4LTEuMzg3IDIuNTI4LTEuMzg3IDIuNyAwIDMuMiAxLjc3OCAzLjIgNC4wOTF2NC43MTVoLS4wMDF6TTcuMDAzIDguNTc1YTEuNTQ2IDEuNTQ2IDAgMDEtMS41NDgtMS41NDkgMS41NDggMS41NDggMCAxMTEuNTQ3IDEuNTQ5aC4wMDF6bTEuMzM2IDkuNzY0SDUuNjY2VjkuNzVIOC4zNHY4LjU4OWgtLjAwMXpNMTkuNjcgM0g0LjMyOUMzLjU5MyAzIDMgMy41OCAzIDQuMjk3djE1LjQwNkMzIDIwLjQyIDMuNTk0IDIxIDQuMzI4IDIxaDE1LjMzOEMyMC40IDIxIDIxIDIwLjQyIDIxIDE5LjcwM1Y0LjI5N0MyMSAzLjU4IDIwLjQgMyAxOS42NjYgM2guMDA0eiIvPjwvc3ZnPg==);
     mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTE4LjMzNSAxOC4zMzlIMTUuNjd2LTQuMTc3YzAtLjk5Ni0uMDItMi4yNzgtMS4zOS0yLjI3OC0xLjM4OSAwLTEuNjAxIDEuMDg0LTEuNjAxIDIuMjA1djQuMjVoLTIuNjY2VjkuNzVoMi41NnYxLjE3aC4wMzVjLjM1OC0uNjc0IDEuMjI4LTEuMzg3IDIuNTI4LTEuMzg3IDIuNyAwIDMuMiAxLjc3OCAzLjIgNC4wOTF2NC43MTVoLS4wMDF6TTcuMDAzIDguNTc1YTEuNTQ2IDEuNTQ2IDAgMDEtMS41NDgtMS41NDkgMS41NDggMS41NDggMCAxMTEuNTQ3IDEuNTQ5aC4wMDF6bTEuMzM2IDkuNzY0SDUuNjY2VjkuNzVIOC4zNHY4LjU4OWgtLjAwMXpNMTkuNjcgM0g0LjMyOUMzLjU5MyAzIDMgMy41OCAzIDQuMjk3djE1LjQwNkMzIDIwLjQyIDMuNTk0IDIxIDQuMzI4IDIxaDE1LjMzOEMyMC40IDIxIDIxIDIwLjQyIDIxIDE5LjcwM1Y0LjI5N0MyMSAzLjU4IDIwLjQgMyAxOS42NjYgM2guMDA0eiIvPjwvc3ZnPg==);
   }
   
  .instagram::before {
     -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyIDJjMi43MTcgMCAzLjA1Ni4wMSA0LjEyMi4wNiAxLjA2NS4wNSAxLjc5LjIxNyAyLjQyOC40NjUuNjYuMjU0IDEuMjE2LjU5OCAxLjc3MiAxLjE1My41MDguNS45MDIgMS4xMDUgMS4xNTMgMS43NzIuMjQ3LjYzNy40MTUgMS4zNjMuNDY1IDIuNDI4LjA0NyAxLjA2Ni4wNiAxLjQwNS4wNiA0LjEyMiAwIDIuNzE3LS4wMSAzLjA1Ni0uMDYgNC4xMjItLjA1IDEuMDY1LS4yMTggMS43OS0uNDY1IDIuNDI4YTQuODgzIDQuODgzIDAgMDEtMS4xNTMgMS43NzJjLS41LjUwOC0xLjEwNS45MDItMS43NzIgMS4xNTMtLjYzNy4yNDctMS4zNjMuNDE1LTIuNDI4LjQ2NS0xLjA2Ni4wNDctMS40MDUuMDYtNC4xMjIuMDYtMi43MTcgMC0zLjA1Ni0uMDEtNC4xMjItLjA2LTEuMDY1LS4wNS0xLjc5LS4yMTgtMi40MjgtLjQ2NWE0Ljg5IDQuODkgMCAwMS0xLjc3Mi0xLjE1MyA0LjkwNCA0LjkwNCAwIDAxLTEuMTUzLTEuNzcyYy0uMjQ4LS42MzctLjQxNS0xLjM2My0uNDY1LTIuNDI4QzIuMDEzIDE1LjA1NiAyIDE0LjcxNyAyIDEyYzAtMi43MTcuMDEtMy4wNTYuMDYtNC4xMjIuMDUtMS4wNjYuMjE3LTEuNzkuNDY1LTIuNDI4YTQuODggNC44OCAwIDAxMS4xNTMtMS43NzJBNC44OTcgNC44OTcgMCAwMTUuNDUgMi41MjVjLjYzOC0uMjQ4IDEuMzYyLS40MTUgMi40MjgtLjQ2NUM4Ljk0NCAyLjAxMyA5LjI4MyAyIDEyIDJ6bTAgNWE1IDUgMCAxMDAgMTAgNSA1IDAgMDAwLTEwem02LjUtLjI1YTEuMjUgMS4yNSAwIDEwLTIuNSAwIDEuMjUgMS4yNSAwIDAwMi41IDB6TTEyIDlhMyAzIDAgMTEwIDYgMyAzIDAgMDEwLTZ6Ii8+PC9zdmc+);
    mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTEyIDJjMi43MTcgMCAzLjA1Ni4wMSA0LjEyMi4wNiAxLjA2NS4wNSAxLjc5LjIxNyAyLjQyOC40NjUuNjYuMjU0IDEuMjE2LjU5OCAxLjc3MiAxLjE1My41MDguNS45MDIgMS4xMDUgMS4xNTMgMS43NzIuMjQ3LjYzNy40MTUgMS4zNjMuNDY1IDIuNDI4LjA0NyAxLjA2Ni4wNiAxLjQwNS4wNiA0LjEyMiAwIDIuNzE3LS4wMSAzLjA1Ni0uMDYgNC4xMjItLjA1IDEuMDY1LS4yMTggMS43OS0uNDY1IDIuNDI4YTQuODgzIDQuODgzIDAgMDEtMS4xNTMgMS43NzJjLS41LjUwOC0xLjEwNS45MDItMS43NzIgMS4xNTMtLjYzNy4yNDctMS4zNjMuNDE1LTIuNDI4LjQ2NS0xLjA2Ni4wNDctMS40MDUuMDYtNC4xMjIuMDYtMi43MTcgMC0zLjA1Ni0uMDEtNC4xMjItLjA2LTEuMDY1LS4wNS0xLjc5LS4yMTgtMi40MjgtLjQ2NWE0Ljg5IDQuODkgMCAwMS0xLjc3Mi0xLjE1MyA0LjkwNCA0LjkwNCAwIDAxLTEuMTUzLTEuNzcyYy0uMjQ4LS42MzctLjQxNS0xLjM2My0uNDY1LTIuNDI4QzIuMDEzIDE1LjA1NiAyIDE0LjcxNyAyIDEyYzAtMi43MTcuMDEtMy4wNTYuMDYtNC4xMjIuMDUtMS4wNjYuMjE3LTEuNzkuNDY1LTIuNDI4YTQuODggNC44OCAwIDAxMS4xNTMtMS43NzJBNC44OTcgNC44OTcgMCAwMTUuNDUgMi41MjVjLjYzOC0uMjQ4IDEuMzYyLS40MTUgMi40MjgtLjQ2NUM4Ljk0NCAyLjAxMyA5LjI4MyAyIDEyIDJ6bTAgNWE1IDUgMCAxMDAgMTAgNSA1IDAgMDAwLTEwem02LjUtLjI1YTEuMjUgMS4yNSAwIDEwLTIuNSAwIDEuMjUgMS4yNSAwIDAwMi41IDB6TTEyIDlhMyAzIDAgMTEwIDYgMyAzIDAgMDEwLTZ6Ii8+PC9zdmc+);
  }
  
  .twitter::before {
   -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIyLjE2MiA1LjY1NmE4LjM4NCA4LjM4NCAwIDAxLTIuNDAyLjY1OEE0LjE5NiA0LjE5NiAwIDAwMjEuNiA0Yy0uODIuNDg4LTEuNzE5LjgzLTIuNjU2IDEuMDE1YTQuMTgyIDQuMTgyIDAgMDAtNy4xMjYgMy44MTQgMTEuODc0IDExLjg3NCAwIDAxLTguNjItNC4zNyA0LjE2OCA0LjE2OCAwIDAwLS41NjYgMi4xMDNjMCAxLjQ1LjczOCAyLjczMSAxLjg2IDMuNDgxYTQuMTY4IDQuMTY4IDAgMDEtMS44OTQtLjUyM3YuMDUyYTQuMTg1IDQuMTg1IDAgMDAzLjM1NSA0LjEwMSA0LjIxIDQuMjEgMCAwMS0xLjg5LjA3MkE0LjE4NSA0LjE4NSAwIDAwNy45NyAxNi42NWE4LjM5NCA4LjM5NCAwIDAxLTYuMTkxIDEuNzMyIDExLjgzIDExLjgzIDAgMDA2LjQxIDEuODhjNy42OTMgMCAxMS45LTYuMzczIDExLjktMTEuOSAwLS4xOC0uMDA1LS4zNjItLjAxMy0uNTRhOC40OTYgOC40OTYgMCAwMDIuMDg3LTIuMTY1bC0uMDAxLS4wMDF6Ii8+PC9zdmc+);
  mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIyLjE2MiA1LjY1NmE4LjM4NCA4LjM4NCAwIDAxLTIuNDAyLjY1OEE0LjE5NiA0LjE5NiAwIDAwMjEuNiA0Yy0uODIuNDg4LTEuNzE5LjgzLTIuNjU2IDEuMDE1YTQuMTgyIDQuMTgyIDAgMDAtNy4xMjYgMy44MTQgMTEuODc0IDExLjg3NCAwIDAxLTguNjItNC4zNyA0LjE2OCA0LjE2OCAwIDAwLS41NjYgMi4xMDNjMCAxLjQ1LjczOCAyLjczMSAxLjg2IDMuNDgxYTQuMTY4IDQuMTY4IDAgMDEtMS44OTQtLjUyM3YuMDUyYTQuMTg1IDQuMTg1IDAgMDAzLjM1NSA0LjEwMSA0LjIxIDQuMjEgMCAwMS0xLjg5LjA3MkE0LjE4NSA0LjE4NSAwIDAwNy45NyAxNi42NWE4LjM5NCA4LjM5NCAwIDAxLTYuMTkxIDEuNzMyIDExLjgzIDExLjgzIDAgMDA2LjQxIDEuODhjNy42OTMgMCAxMS45LTYuMzczIDExLjktMTEuOSAwLS4xOC0uMDA1LS4zNjItLjAxMy0uNTRhOC40OTYgOC40OTYgMCAwMDIuMDg3LTIuMTY1bC0uMDAxLS4wMDF6Ii8+PC9zdmc+);
  }
   .youtube::before {
  -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIxLjU0MyA2LjQ5OEMyMiA4LjI4IDIyIDEyIDIyIDEyczAgMy43Mi0uNDU3IDUuNTAyYy0uMjU0Ljk4NS0uOTk3IDEuNzYtMS45MzggMi4wMjJDMTcuODk2IDIwIDEyIDIwIDEyIDIwcy01Ljg5MyAwLTcuNjA1LS40NzZjLS45NDUtLjI2Ni0xLjY4Ny0xLjA0LTEuOTM4LTIuMDIyQzIgMTUuNzIgMiAxMiAyIDEyczAtMy43Mi40NTctNS41MDJjLjI1NC0uOTg1Ljk5Ny0xLjc2IDEuOTM4LTIuMDIyQzYuMTA3IDQgMTIgNCAxMiA0czUuODk2IDAgNy42MDUuNDc2Yy45NDUuMjY2IDEuNjg3IDEuMDQgMS45MzggMi4wMjJ6TTEwIDE1LjVsNi0zLjUtNi0zLjV2N3oiLz48L3N2Zz4=);
  mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTIxLjU0MyA2LjQ5OEMyMiA4LjI4IDIyIDEyIDIyIDEyczAgMy43Mi0uNDU3IDUuNTAyYy0uMjU0Ljk4NS0uOTk3IDEuNzYtMS45MzggMi4wMjJDMTcuODk2IDIwIDEyIDIwIDEyIDIwcy01Ljg5MyAwLTcuNjA1LS40NzZjLS45NDUtLjI2Ni0xLjY4Ny0xLjA0LTEuOTM4LTIuMDIyQzIgMTUuNzIgMiAxMiAyIDEyczAtMy43Mi40NTctNS41MDJjLjI1NC0uOTg1Ljk5Ny0xLjc2IDEuOTM4LTIuMDIyQzYuMTA3IDQgMTIgNCAxMiA0czUuODk2IDAgNy42MDUuNDc2Yy45NDUuMjY2IDEuNjg3IDEuMDQgMS45MzggMi4wMjJ6TTEwIDE1LjVsNi0zLjUtNi0zLjV2N3oiLz48L3N2Zz4=);
  }
  
  .discord::before {
   -webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzEiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA3MSA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik02MC4xMDQ1IDEzLjg5NzhDNTUuNTc5MiAxMS44MjE0IDUwLjcyNjUgMTAuMjkxNiA0NS42NTI3IDkuNDE1NDJDNDUuNTYwMyA5LjM5ODUxIDQ1LjQ2OCA5LjQ0MDc3IDQ1LjQyMDQgOS41MjUyOUM0NC43OTYzIDEwLjYzNTMgNDQuMTA1IDEyLjA4MzQgNDMuNjIwOSAxMy4yMjE2QzM4LjE2MzcgMTIuNDA0NiAzMi43MzQ1IDEyLjQwNDYgMjcuMzg5MiAxMy4yMjE2QzI2LjkwNSAxMi4wNTgxIDI2LjE4ODYgMTAuNjM1MyAyNS41NjE3IDkuNTI1MjlDMjUuNTE0MSA5LjQ0MzU5IDI1LjQyMTggOS40MDEzMyAyNS4zMjk0IDkuNDE1NDJDMjAuMjU4NCAxMC4yODg4IDE1LjQwNTcgMTEuODE4NiAxMC44Nzc2IDEzLjg5NzhDMTAuODM4NCAxMy45MTQ3IDEwLjgwNDggMTMuOTQyOSAxMC43ODI1IDEzLjk3OTVDMS41Nzc5NSAyNy43MzA5IC0wLjk0MzU2MSA0MS4xNDQzIDAuMjkzNDA4IDU0LjM5MTRDMC4yOTkwMDUgNTQuNDU2MiAwLjMzNTM4NiA1NC41MTgyIDAuMzg1NzYxIDU0LjU1NzZDNi40NTg2NiA1OS4wMTc0IDEyLjM0MTMgNjEuNzI0OSAxOC4xMTQ3IDYzLjUxOTVDMTguMjA3MSA2My41NDc3IDE4LjMwNSA2My41MTM5IDE4LjM2MzggNjMuNDM3OEMxOS43Mjk1IDYxLjU3MjggMjAuOTQ2OSA1OS42MDYzIDIxLjk5MDcgNTcuNTM4M0MyMi4wNTIzIDU3LjQxNzIgMjEuOTkzNSA1Ny4yNzM1IDIxLjg2NzYgNTcuMjI1NkMxOS45MzY2IDU2LjQ5MzEgMTguMDk3OSA1NS42IDE2LjMyOTIgNTQuNTg1OEMxNi4xODkzIDU0LjUwNDEgMTYuMTc4MSA1NC4zMDQgMTYuMzA2OCA1NC4yMDgyQzE2LjY3OSA1My45MjkzIDE3LjA1MTMgNTMuNjM5MSAxNy40MDY3IDUzLjM0NjFDMTcuNDcxIDUzLjI5MjYgMTcuNTYwNiA1My4yODEzIDE3LjYzNjIgNTMuMzE1MUMyOS4yNTU4IDU4LjYyMDIgNDEuODM1NCA1OC42MjAyIDUzLjMxNzkgNTMuMzE1MUM1My4zOTM1IDUzLjI3ODUgNTMuNDgzMSA1My4yODk4IDUzLjU1MDIgNTMuMzQzM0M1My45MDU3IDUzLjYzNjMgNTQuMjc3OSA1My45MjkzIDU0LjY1MjkgNTQuMjA4MkM1NC43ODE2IDU0LjMwNCA1NC43NzMyIDU0LjUwNDEgNTQuNjMzMyA1NC41ODU4QzUyLjg2NDYgNTUuNjE5NyA1MS4wMjU5IDU2LjQ5MzEgNDkuMDkyMSA1Ny4yMjI4QzQ4Ljk2NjIgNTcuMjcwNyA0OC45MTAyIDU3LjQxNzIgNDguOTcxOCA1Ny41MzgzQzUwLjAzOCA1OS42MDM0IDUxLjI1NTQgNjEuNTY5OSA1Mi41OTU5IDYzLjQzNUM1Mi42NTE5IDYzLjUxMzkgNTIuNzUyNiA2My41NDc3IDUyLjg0NSA2My41MTk1QzU4LjY0NjQgNjEuNzI0OSA2NC41MjkgNTkuMDE3NCA3MC42MDE5IDU0LjU1NzZDNzAuNjU1MSA1NC41MTgyIDcwLjY4ODcgNTQuNDU5IDcwLjY5NDMgNTQuMzk0MkM3Mi4xNzQ3IDM5LjA3OTEgNjguMjE0NyAyNS43NzU3IDYwLjE5NjggMTMuOTgyM0M2MC4xNzcyIDEzLjk0MjkgNjAuMTQzNyAxMy45MTQ3IDYwLjEwNDUgMTMuODk3OFpNMjMuNzI1OSA0Ni4zMjUzQzIwLjIyNzYgNDYuMzI1MyAxNy4zNDUxIDQzLjExMzYgMTcuMzQ1MSAzOS4xNjkzQzE3LjM0NTEgMzUuMjI1IDIwLjE3MTcgMzIuMDEzMyAyMy43MjU5IDMyLjAxMzNDMjcuMzA4IDMyLjAxMzMgMzAuMTYyNiAzNS4yNTMyIDMwLjEwNjYgMzkuMTY5M0MzMC4xMDY2IDQzLjExMzYgMjcuMjggNDYuMzI1MyAyMy43MjU5IDQ2LjMyNTNaTTQ3LjMxNzggNDYuMzI1M0M0My44MTk2IDQ2LjMyNTMgNDAuOTM3MSA0My4xMTM2IDQwLjkzNzEgMzkuMTY5M0M0MC45MzcxIDM1LjIyNSA0My43NjM2IDMyLjAxMzMgNDcuMzE3OCAzMi4wMTMzQzUwLjkgMzIuMDEzMyA1My43NTQ1IDM1LjI1MzIgNTMuNjk4NiAzOS4xNjkzQzUzLjY5ODYgNDMuMTEzNiA1MC45IDQ2LjMyNTMgNDcuMzE3OCA0Ni4zMjUzWiIgZmlsbD0iIzU4NjVGMiIvPg0KPC9zdmc+);
  mask-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzEiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA3MSA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik02MC4xMDQ1IDEzLjg5NzhDNTUuNTc5MiAxMS44MjE0IDUwLjcyNjUgMTAuMjkxNiA0NS42NTI3IDkuNDE1NDJDNDUuNTYwMyA5LjM5ODUxIDQ1LjQ2OCA5LjQ0MDc3IDQ1LjQyMDQgOS41MjUyOUM0NC43OTYzIDEwLjYzNTMgNDQuMTA1IDEyLjA4MzQgNDMuNjIwOSAxMy4yMjE2QzM4LjE2MzcgMTIuNDA0NiAzMi43MzQ1IDEyLjQwNDYgMjcuMzg5MiAxMy4yMjE2QzI2LjkwNSAxMi4wNTgxIDI2LjE4ODYgMTAuNjM1MyAyNS41NjE3IDkuNTI1MjlDMjUuNTE0MSA5LjQ0MzU5IDI1LjQyMTggOS40MDEzMyAyNS4zMjk0IDkuNDE1NDJDMjAuMjU4NCAxMC4yODg4IDE1LjQwNTcgMTEuODE4NiAxMC44Nzc2IDEzLjg5NzhDMTAuODM4NCAxMy45MTQ3IDEwLjgwNDggMTMuOTQyOSAxMC43ODI1IDEzLjk3OTVDMS41Nzc5NSAyNy43MzA5IC0wLjk0MzU2MSA0MS4xNDQzIDAuMjkzNDA4IDU0LjM5MTRDMC4yOTkwMDUgNTQuNDU2MiAwLjMzNTM4NiA1NC41MTgyIDAuMzg1NzYxIDU0LjU1NzZDNi40NTg2NiA1OS4wMTc0IDEyLjM0MTMgNjEuNzI0OSAxOC4xMTQ3IDYzLjUxOTVDMTguMjA3MSA2My41NDc3IDE4LjMwNSA2My41MTM5IDE4LjM2MzggNjMuNDM3OEMxOS43Mjk1IDYxLjU3MjggMjAuOTQ2OSA1OS42MDYzIDIxLjk5MDcgNTcuNTM4M0MyMi4wNTIzIDU3LjQxNzIgMjEuOTkzNSA1Ny4yNzM1IDIxLjg2NzYgNTcuMjI1NkMxOS45MzY2IDU2LjQ5MzEgMTguMDk3OSA1NS42IDE2LjMyOTIgNTQuNTg1OEMxNi4xODkzIDU0LjUwNDEgMTYuMTc4MSA1NC4zMDQgMTYuMzA2OCA1NC4yMDgyQzE2LjY3OSA1My45MjkzIDE3LjA1MTMgNTMuNjM5MSAxNy40MDY3IDUzLjM0NjFDMTcuNDcxIDUzLjI5MjYgMTcuNTYwNiA1My4yODEzIDE3LjYzNjIgNTMuMzE1MUMyOS4yNTU4IDU4LjYyMDIgNDEuODM1NCA1OC42MjAyIDUzLjMxNzkgNTMuMzE1MUM1My4zOTM1IDUzLjI3ODUgNTMuNDgzMSA1My4yODk4IDUzLjU1MDIgNTMuMzQzM0M1My45MDU3IDUzLjYzNjMgNTQuMjc3OSA1My45MjkzIDU0LjY1MjkgNTQuMjA4MkM1NC43ODE2IDU0LjMwNCA1NC43NzMyIDU0LjUwNDEgNTQuNjMzMyA1NC41ODU4QzUyLjg2NDYgNTUuNjE5NyA1MS4wMjU5IDU2LjQ5MzEgNDkuMDkyMSA1Ny4yMjI4QzQ4Ljk2NjIgNTcuMjcwNyA0OC45MTAyIDU3LjQxNzIgNDguOTcxOCA1Ny41MzgzQzUwLjAzOCA1OS42MDM0IDUxLjI1NTQgNjEuNTY5OSA1Mi41OTU5IDYzLjQzNUM1Mi42NTE5IDYzLjUxMzkgNTIuNzUyNiA2My41NDc3IDUyLjg0NSA2My41MTk1QzU4LjY0NjQgNjEuNzI0OSA2NC41MjkgNTkuMDE3NCA3MC42MDE5IDU0LjU1NzZDNzAuNjU1MSA1NC41MTgyIDcwLjY4ODcgNTQuNDU5IDcwLjY5NDMgNTQuMzk0MkM3Mi4xNzQ3IDM5LjA3OTEgNjguMjE0NyAyNS43NzU3IDYwLjE5NjggMTMuOTgyM0M2MC4xNzcyIDEzLjk0MjkgNjAuMTQzNyAxMy45MTQ3IDYwLjEwNDUgMTMuODk3OFpNMjMuNzI1OSA0Ni4zMjUzQzIwLjIyNzYgNDYuMzI1MyAxNy4zNDUxIDQzLjExMzYgMTcuMzQ1MSAzOS4xNjkzQzE3LjM0NTEgMzUuMjI1IDIwLjE3MTcgMzIuMDEzMyAyMy43MjU5IDMyLjAxMzNDMjcuMzA4IDMyLjAxMzMgMzAuMTYyNiAzNS4yNTMyIDMwLjEwNjYgMzkuMTY5M0MzMC4xMDY2IDQzLjExMzYgMjcuMjggNDYuMzI1MyAyMy43MjU5IDQ2LjMyNTNaTTQ3LjMxNzggNDYuMzI1M0M0My44MTk2IDQ2LjMyNTMgNDAuOTM3MSA0My4xMTM2IDQwLjkzNzEgMzkuMTY5M0M0MC45MzcxIDM1LjIyNSA0My43NjM2IDMyLjAxMzMgNDcuMzE3OCAzMi4wMTMzQzUwLjkgMzIuMDEzMyA1My43NTQ1IDM1LjI1MzIgNTMuNjk4NiAzOS4xNjkzQzUzLjY5ODYgNDMuMTEzNiA1MC45IDQ2LjMyNTMgNDcuMzE3OCA0Ni4zMjUzWiIgZmlsbD0iIzU4NjVGMiIvPg0KPC9zdmc+);
  }
  </style>
  </body>
  </html>
`;
};
