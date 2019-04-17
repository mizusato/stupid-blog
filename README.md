# Stupid Blog

This is a lightweight developer-oriented single-page app for web blogging.

****The development of this project was finished just recently, it may be unstable now.**

Features:

- no database required, saving all data in just one JSON file

- writing articles using full-featured HTML with no restriction

- hidden administration interface, only accessible with customized URL

- static file hosting with directory listing

- diqus comment system, can be enabled/disabled

- formula rendering with KaTeX

- syntax highlighting with hightlight.js

- providing simple semantic html page for search engine crawlers


## Installation

```
$ git clone https://notabug.org/mizusato/stupid-blog
$ cd stupid-blog
$ git update-index --assume-unchanged password.json
$ git update-index --assume-unchanged data/data.json
$ npm install
$ ./reset.js
input new url for admin interface: /my-admin  # customize your admin url here
input new username: **
input new password: ***
credentials updated successfully.
please restart the server to apply changes.
$ ./server.js
***
listening on port 9487
```

Then goto `http://localhost:9487/<YourCustomizedURL>` to configure your site. (The administration interface is PC-only, don't use mobile device to access it)

It is possible to use other port by specifing `./server.js --port=PORT`.


## Explanation

### Why not English/l10n for UI ?

This project was initially developed for my personal use. I want it to be open source so I uploaded it to the online git service. Therefore, all messages in the UI are written in Traditional Chinese. If you don't speak Chinese, you can simply translate the messages defined in `common/msg.js`. It is quite easy with a online translation service. Futhermore, if someone could add a l10n feature to the app, I will be glad to accept it.

### Why not Webpack/Babel ?

I want the app to be fully hackable, that is, easy to be customized in code-level, as it is developer-oriented. Webpack/Babel requires a huge development environment to be configured, and also requires a compilation process, which increases the difficulty of customizing the app in code-level.

Not using Babel actually causes compatibility problems, if the browser of user don't support ES2017, the app won't work at all. But there is no need to worry about it if your blog posts are developer-oriented.

### Why not a file management system ?

The app will serve `files` folder directly as `http://localhost:XXXX/files/`. It is easy to establish a FTP/SFTP service on this folder, so file management system is unecessary.

### Why not a data Model/Schema ?

The backend API does not restrict the format of coming data. However, there is no security problem since only the administrator of the site can push data to the API. The advantage of this design is that, for example, if you want to add a field to the settings, simply modify the front-end script, it will work.

## LICENSE

The source code of this program is licensed under GPLv2.

The built-in icons in this program are from `gnome-icon-theme`, `tangerine-icon-theme`, `oxygen-icon-theme`, `simpleicon.com` and `open-iconic`, licensed under their original license.
