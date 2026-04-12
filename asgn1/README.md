**bug(?):** it seems that on Firefox, slider positions/radio button selections are saved upon refreshing the page, but their JS values are internally reset, causing inconsistent-looking behavior. this does not appear to be a problem on Chrome, where selections are reset upon refresh.


References:
- [MDN](https://developer.mozilla.org/en-US/docs/Web) docs for general HTML and CSS
- Iterating over ElementsByName from radio buttons: [StackOverflow](https://stackoverflow.com/a/15843940)
- I tried to initialize click listeners in a for loop and it was buggy because of [this](https://stackoverflow.com/a/19586183) issue but I didn't understand closures so I used a for-each loop and it worked