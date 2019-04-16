Untitled Squirrel Game
======================

This branch contains an early version of online multiplayer. It is error-prone,
allows cheating, and doesn't synchronize scores, but it does work a little.

To run the server, you will need [Node.js](https://nodejs.org) and
[npm](https://npmjs.com). First, install dependencies:

```bash
$ cd server
$ npm install
```

Then run `server/main.js`:

```bash
$ node main.js
listening on port 3000
```

Then visit http://localhost:3000/ in two tabs, or on another computer using your
computer's local IP address. **Both players use the keybindings for player 1.**

Basic Info
----------

Shoot your opponent to knock them out of the safe area and score a point. Fuel
and ammo are limited. Fuel refills when you are on the ground. Ammo can be
reloaded manually, but will reload automatically when it runs out.

Keyboard Bindings
-----------------

Player 1                 | Player 2
-------------------------|-------------------------
<kbd>W</kbd>: throttle   | <kbd>I</kbd>: throttle
<kbd>A</kbd>: fly left   | <kbd>J</kbd>: fly left
<kbd>S</kbd>: shoot down | <kbd>K</kbd>: shoot down
<kbd>D</kbd>: fly right  | <kbd>L</kbd>: fly right
<kbd>R</kbd>: reload     | <kbd>U</kbd>: reload
<kbd>F</kbd>: shoot      | <kbd>H</kbd>: shoot

<kbd>ESC</kbd>: pause/unpause

Controller Bindings (two controllers must be connected) (don't work in multiplayer)
-----------------------------------------------------------------------------------

- <kbd>LT</kbd>: throttle
- <kbd>LS</kbd>: fly (left/right)
- <kbd>RS</kbd>: aim (any direction)
- <kbd>RB</kbd>: shoot
- <kbd>X</kbd> (on Xbox-style controller): reload
- <kbd>START</kbd>: pause/unpause

---

The above information is also in the game; click the ? icon on the start screen.
