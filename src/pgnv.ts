import {
  faRotate,
  faBackwardFast,
  faBackwardStep,
  faForwardStep,
  faCirclePlay,
  faCirclePause,
  faForwardFast,
  faLightbulb,
  faQuestion,
  faHandPointUp,
  faScissors,
  faPrint,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { library, dom } from "@fortawesome/fontawesome-svg-core";

library.add(
  faRotate,
  faBackwardFast,
  faBackwardStep,
  faForwardStep,
  faCirclePlay,
  faCirclePause,
  faForwardFast,
  faLightbulb,
  faQuestion,
  faHandPointUp,
  faScissors,
  faPrint,
  faGear,
);
dom.watch();
import { Chessground } from "chessground";
import { Color } from "chessground/types";
import { Config } from "chessground/config";
import "../node_modules/chessground/assets/chessground.base.css";
import "../node_modules/chessground/assets/chessground.brown.css";
import Mousetrap from "mousetrap-ts";
import { Field, GameComment, hasDiagramNag, NAGs, nagToSymbol, PgnReader, PgnReaderMove, PROMOTIONS, Shape } from "@mliebelt/pgn-reader";
import { ParseTree } from "@mliebelt/pgn-parser";
import { i18next } from "./i18n";
import Timer from "./timer";
import resizeHandle from "./resize";
import { Base, Layout, PgnViewerConfiguration, PgnViewerMode, PieceStyle, PrimitiveMove, ShortColor, SupportedLocales, TagKeys, Tags, Theme } from "./types";
import { pgnEdit } from ".";

import Modaly from "modaly.js";

/**
 * This implements the base function that is used to display a board, a whole game
 * or even allow to play it.
 * See the other functions and their implementation how to use the building blocks
 * of pgnBase to build new functionality. The configuration here is the super-set
 * of all the configurations of the other functions.
 */
let pgnBase = function (boardId: string, configuration: PgnViewerConfiguration) {
  // Section defines the variables needed everywhere.
  let that: Base = { mypgn: null, board: null, mousetrap: null };
  that.userConfiguration = configuration;
  // Sets the default parameters for all modes. See individual functions for individual overwrites
  let defaults: PgnViewerConfiguration = {
    lazyLoad: true,
    // theme: "blue",
    pieceStyle: PieceStyle.Merida,
    // width: '320px',
    // boardSize: '320px',
    manyGames: false,
    showCoords: true,
    orientation: "white",
    position: "start",
    showFen: false,
    layout: Layout.Top,
    headers: false,
    timerTime: 700,
    locale: "en",
    movable: { free: false }, // no documentation
    highlight: { lastMove: true }, // no documentation
    viewOnly: true, // no documentation
    hideMovesBefore: false,
    colorMarker: null,
    showResult: false,
    timeAnnotation: {},
    notation: "short",
    notationLayout: "inline", // Possible: inline, list, allList
    figurine: null,
    resizable: true,
    IDs: {
      bottomHeaderId: boardId + "BottomHeader",
      topHeaderId: boardId + "TopHeader",
      innerBoardId: boardId + "Inner",
      movesId: boardId + "Moves",
      buttonsId: boardId + "Button",
      fenId: boardId + "Fen",
      colorMarkerId: boardId + "ColorMarker",
      hintsId: boardId + "Hints",
    },
  };
  that.configuration = Object.assign(Object.assign(defaults, PgnBaseDefaults), configuration);
  that.mypgn = new PgnReader(that.configuration);

  const timer = new Timer(10);
  const moveDelay = 400; //delay to play reply in puzzle mode

  let chess = that.mypgn.chess; // Use the same instance from chess.src
  let hintsShown: number = 0;
  let theme = that.configuration.theme || Theme.Default;
  function hasMode(mode: PgnViewerMode) {
    return that.configuration.mode === mode;
  }
  function possibleMoves(fen: string): Map<Field, Field[]> {
    return that.mypgn.possibleMoves(fen);
  }
  function id(id: string): string {
    return that.configuration.IDs[id];
  }
  function isElement(obj: any): boolean {
    return !!(obj && obj?.nodeType === 1);
  }
  that.board = null; // Will be set later, but has to be a known variable

  // Initialize locale
  let locale: SupportedLocales = that.configuration.locale || "en";
  that.configuration.i18n = i18next(locale);
  that.configuration.defaultI18n = i18next("en");

  function t(term: string): string {
    if (that.configuration.i18n) {
      let ret = that.configuration.i18n[term]();
      if (!ret) {
        ret = that.configuration.defaultI18n[term]();
        return ret ? ret : term;
      }
      return ret;
    }
    return term.substring(term.indexOf(":") + 1);
  }

  if (that.configuration.position) {
    // Allow early correction
    if (that.configuration.position !== "start") {
      let tokens = that.configuration.position.split(/\s+/);
      if (tokens.length === 4) {
        // patches the FEN string, if only 4 elements contained
        that.configuration.position += " 1 1";
      }
    }
  }

  /**
   * Allow logging of error to HTML.
   */
  function logError(str: string) {
    let node = document.createElement("DIV");
    const textnode = document.createTextNode(str);
    node.appendChild(textnode);
    that.errorDiv.appendChild(node);
  }

  /*
     helper functions for hints in puzzle mode
     */
  function showHint(h: string) {
    let hintsView: HTMLTextAreaElement = document.getElementById(id("hintsId")) as HTMLTextAreaElement;
    if (hintsView) {
      if (hintsShown > 0) {
        hintsView.value += "\n";
      }
      hintsView.value += h;
    }
    hintsShown++;
  }

  function resetHints() {
    let hintsView: HTMLTextAreaElement = document.getElementById(id("hintsId")) as HTMLTextAreaElement;
    if (hintsView) {
      hintsView.value = "";
      hintsShown = 0;
    }
  }

  /**
   * Adds a class to an element.
   */
  function addClass(elementOrId: string | HTMLElement, className: string) {
    let ele: HTMLElement = isElement(elementOrId) ? (elementOrId as HTMLElement) : document.getElementById(elementOrId as string);
    if (!ele) return;
    if (ele.classList) {
      ele.classList.add(className);
    } else {
      ele.className += " " + className;
    }
  }

  /**
   * Remove a class from an element.
   */
  function removeClass(elementOrId: string | HTMLElement, className: string) {
    let ele: HTMLElement = isElement(elementOrId) ? (elementOrId as HTMLElement) : document.getElementById(elementOrId as string);
    if (ele === null) return;
    if (ele.classList) {
      ele.classList.remove(className);
    } else {
      ele.className = ele.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
    }
  }

  /**
   * Comments are generated inline, there is no special block rendering
   * possible for them.
   * @param comment the comment to render as span
   * @param clazz class parameter appended to differentiate different comments
   * @returns {HTMLElement} the new created span with the comment as text, or null, if text is null
   */
  function generateCommentSpan(comment: string, clazz: string): HTMLElement {
    if (comment && typeof comment == "string") {
      const commentSpan = createEle("span", null, "comment " + clazz);
      commentSpan.appendChild(document.createTextNode(" " + comment + " "));
      return commentSpan;
    }
    return null;
  }

  function createFiller(span: HTMLElement) {
    const filler = createEle("span", null, "move filler");
    filler.appendChild(document.createTextNode("... "));
    span.appendChild(filler);
  }

  function appendCommentSpan(span: HTMLElement, comment: string, clazz: string, fillNeeded?: boolean) {
    let cSpan = generateCommentSpan(comment, clazz);
    if (cSpan) {
      if (fillNeeded) {
        createFiller(span);
      }
      span.appendChild(cSpan);
      return fillNeeded;
    }
    return false;
  }
  /**
   * Inserts an element after targetElement
   * @param {*} newElement the element to insert
   * @param {*} targetElement the element after to insert
   */
  function insertAfter(newElement: HTMLElement, targetElement: HTMLElement) {
    const parent = targetElement.parentNode;
    if (parent.lastChild === targetElement) {
      parent.appendChild(newElement);
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling);
    }
  }

  function insertBefore(newElement: HTMLElement, targetElement: HTMLElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement);
  }

  /**
   * Adds an event listener to the DOM element.
   */
  function addEventListener(elementOrId: string | HTMLElement, event: any, func: any) {
    let ele: HTMLElement = isElement(elementOrId) ? (elementOrId as HTMLElement) : document.getElementById(elementOrId as string);
    if (ele === null) return;
    ele.addEventListener(event, func);
  }

  function toggleColorMarker(nextColor: ShortColor) {
    let ele = document.getElementById(id("colorMarkerId"));
    if (!ele) return;
    if (ele.classList.contains("cm-black") && nextColor === "w") {
      ele.classList.remove("cm-black");
    } else if (nextColor === "b") {
      ele.classList.add("cm-black");
    }
  }

  /**
   * Scroll if element is not visible
   * @param element the element to show by scrolling
   */
  function scrollToView(element: HTMLElement) {
    function scrollParentToChild(parent: HTMLElement, child: HTMLElement) {
      let parentRect = parent.getBoundingClientRect();
      // What can you see?
      let parentViewableArea = {
        height: parent.clientHeight,
        width: parent.clientWidth,
      };

      // Where is the child
      let childRect = child.getBoundingClientRect();
      // Is the child viewable?
      let isViewable = childRect.top >= parentRect.top && childRect.top <= parentRect.top + parentViewableArea.height;

      // if you can't see the child try to scroll parent
      if (!isViewable) {
        // scroll by offset relative to parent
        parent.scrollTop = childRect.top + parent.scrollTop - parentRect.top;
      }
    }

    const node = element;
    const movesNode = node.parentElement;
    scrollParentToChild(movesNode, node);
  }

  /**
   * Allows for move to be made programmatically from external javascript
   * @param san the san formatted move to play
   */
  function manualMove(san: string) {
    const m = chess.move(san);
    if (m === null) return;
    chess.undo();
    onSnapEnd(m.from, m.to, null);
    that.board.set({ fen: chess.fen() });
  }

  /**
   * Called when the piece is released. Here should be the logic for calling all
   * pgn enhancement.
   * @param from the source
   * @param to the destination
   * @param meta additional parameters (not used at the moment)
   */
  function onSnapEnd(from: Field, to: Field, meta: any) {
    function positionPromDiv(to: Field, modID: string) {
      let boardRect = document.getElementById(id("innerBoardId")).getBoundingClientRect();
      let _tor = 9 - parseInt(to.substring(1));
      let _toc = to.charCodeAt(0) - 96;
      let _l = boardRect.x + (boardRect.width / 8) * _toc;
      let _t = boardRect.y + (boardRect.height / 8) * _tor;
      if (_tor === 8) {
        document.querySelector(modID).setAttribute("style", "top: " + (_t - 120) + "px; left: " + _l + "px;");
      } else {
        document.querySelector(modID).setAttribute("style", "top: " + _t + "px; left: " + _l + "px;");
      }
    }

    function isValidPuzzleMove(from: Field, to: Field) {
      if (!hasMode(PgnViewerMode.Puzzle)) {
        return true;
      }
      if (that.currentMove < that.mypgn.moves.length - 1) {
        let moveId: number = that.mypgn.getMove(that.currentMove).next;
        let correctMove: PgnReaderMove = that.mypgn.getMove(moveId);
        return correctMove.from == from && correctMove.to == to;
      } else {
        return true;
      }
    }

    const cur = that.currentMove;
    let primMove: PrimitiveMove = { from: from, to: to };
    if (cur) {
      that.mypgn.chess.load(that.mypgn.getMove(cur)?.fen);
    }
    if (that.mypgn.chess.get(from).type === "p" && (to.substring(1, 2) === "8" || to.substring(1, 2) === "1")) {
      that.configuration.modalClicked = function (value: "q" | "r" | "b" | "n") {
        primMove.promotion = value;
        that.configuration.modal.hide();
        onSnapEndFinish();
      };
      let modID = "#" + boardId + "Prommodal";
      positionPromDiv(to, modID);
      that.configuration.modal.show();
    } else {
      onSnapEndFinish();
    }

    function onSnapEndFinish() {
      let validMove: boolean = isValidPuzzleMove(from, to);
      if (hasMode(PgnViewerMode.Puzzle) && !validMove) {
        let moveIndex: number = 0;
        if (!validMove) {
          if (that.currentMove == undefined) {
            moveIndex = 0;
          } else {
            moveIndex = that.mypgn.getMove(that.currentMove).index;
          }
          let fen = that.mypgn.getMove(moveIndex).fen;
          makeMove(that.currentMove, moveIndex, fen);
        }
      } else {
        that.currentMove = that.mypgn.addMove(primMove, cur);
        const move = that.mypgn.getMove(that.currentMove);
        //            console.log(JSON.stringify(move))
        if (primMove.promotion) {
          let pieces = new Map();
          that.board.setPieces(pieces);
          pieces.set(to, {
            color: move.turn == "w" ? "white" : "black",
            role: PROMOTIONS[primMove.promotion],
            promoted: true,
          });
          that.board.setPieces(pieces);
        }
        if (move.notation.ep) {
          let ep_field = to[0] + from[1];
          let pieces = new Map();
          pieces.set(ep_field, null);
          that.board.setPieces(pieces);
        }
        if (moveSpan(that.currentMove) === null) {
          generateMove(that.currentMove, null, move, move.prev, document.getElementById(id("movesId")), []);
        }
        unmarkMark(that.currentMove);

        if (hasMode(PgnViewerMode.Puzzle)) {
          let moveIndex: number = 0;
          let playMove: boolean = false;

          if (that.currentMove != undefined && that.currentMove < that.mypgn.moves.length - 1) {
            let moveId: number = that.mypgn.getMove(that.currentMove).next;

            moveIndex = that.mypgn.getMove(moveId).index;
            playMove = true;
          } else if (that.currentMove == undefined) {
            moveIndex = that.mypgn.getMove(1).index;
            playMove = true;
          }

          if (playMove) {
            let fen = that.mypgn.getMove(moveIndex).fen;

            setTimeout(() => {
              makeMove(that.currentMove, moveIndex, fen);
              resetHints();
              regenerateMoves(that.mypgn.getMoves());
            }, moveDelay);
          } else {
            regenerateMoves(that.mypgn.getMoves());
          }
        } else {
          let col = move.turn == "w" ? "black" : "white";

          that.board.set({
            movable: Object.assign({}, that.board.state.movable, {
              color: col,
              dests: possibleMoves(move.fen),
              showDests: true,
            }),
            check: chess.in_check(),
          });
        }
        updateUI(that.currentMove);

        //makeMove(null, that.currentMove, move.fen)
        let fenView = document.getElementById(id("fenId")) as HTMLTextAreaElement;
        if (fenView) {
          fenView.value = move.fen;
        }
        toggleColorMarker(move.turn);
        resizeLayout();
      }
    }
  }

  // Utility function for generating general HTML elements with id, class (with theme)
  function createEle(kind: keyof HTMLElementTagNameMap, id: string, clazz?: string, my_theme?: string, father?: HTMLElement): HTMLElement {
    const ele = document.createElement(kind);
    if (id) {
      ele.setAttribute("id", id);
    }
    if (clazz) {
      if (my_theme) {
        ele.setAttribute("class", my_theme + " " + clazz);
      } else {
        ele.setAttribute("class", clazz);
      }
    }
    if (father) {
      father.appendChild(ele);
    }
    return ele;
  }

  // Internationionalize the figures in SAN
  function i18nSan(san: string) {
    function i18nFig(fig: string, locale: SupportedLocales) {
      return t("chess:" + fig);
    }
    let locale = that.configuration.locale;
    let figurine = that.configuration.figurine;
    if (!locale || figurine) return san;
    let new_san = san;
    if (!(san.match(/^[a-h]?x/) || san.match(/^[a-h]\d/) || san.match(/^O/))) {
      let move_fig = i18nFig(san[0], locale);
      new_san = san.replace(san[0], move_fig);
    }
    let m = new_san.match(/=([QRNB])/);
    if (m) {
      new_san = new_san.replace(m[1], i18nFig(m[1], locale));
    }
    return new_san;
  }

  function clearChilds(htmlElement: HTMLElement) {
    while (htmlElement.childNodes.length > 0) {
      htmlElement.removeChild(htmlElement.childNodes[0]);
    }
  }

  /**
   * Generates all HTML elements needed for display of the (playing) board and
   * the moves. Generates that in dependence of the theme
   */
  function generateHTML() {
    // Utility function for generating buttons divs
    function addButton(pair: [string, string], buttonDiv: HTMLElement) {
      const l_theme = ["green", "blue"].indexOf(theme) >= 0 ? theme : "default";
      const button = createEle("span", id("buttonsId") + pair[0], "pgnvbutton " + pair[0], l_theme, buttonDiv);
      const faButton = createEle("i", null, "fa " + pair[0] + " " + pair[1], l_theme, button);
      const title = t("buttons:" + pair[0]);
      document.getElementById(id("buttonsId") + pair[0]).setAttribute("title", title);
      return button;
    }

    // Generates the view buttons (only)
    function generateViewButtons(buttonDiv: HTMLElement) {
      [
        ["flipper", "fa-rotate"],
        ["first", "fa-fast-backward"],
        ["prev", "fa-step-backward"],
        ["next", "fa-step-forward"],
        ["play", "fa-play-circle"],
        ["last", "fa-fast-forward"],
      ].forEach(function (entry: [string, string]) {
        addButton(entry, buttonDiv);
      });
    }
    // Generates the edit buttons (only)
    function generateEditButtons(buttonDiv: HTMLElement) {
      [
        ["promoteVar", "fa-hand-point-up"],
        ["deleteMoves", "fa-cut"],
      ].forEach(function (entry: [string, string]) {
        addButton(entry, buttonDiv);
        //but.className = but.className + " gray" // just a test, worked.
        // only gray out if not usable, check that later.
      });
      [
        ["pgn", "fa-print"],
        ["nags", "fa-cog"],
      ].forEach(function (entry: [string, string]) {
        addButton(entry, buttonDiv);
      });
    }

    //generate puzzle buttons
    function generatePuzzleButtons(buttonDiv: HTMLElement) {
      [
        ["getHint", "fa-lightbulb"],
        ["makeMove", "fa-step-forward"],
        ["showSolution", "fa-question"],
      ].forEach(function (entry: [string, string]) {
        addButton(entry, buttonDiv);
      });
    }

    // Generate 3 rows, similar to lichess in studies
    function generateNagMenu(nagEle: HTMLElement) {
      function generateRow(array: number[], rowClass: string, nagEle: HTMLElement) {
        function generateLink(link: number, nagDiv: HTMLElement) {
          let generateIcon = function (icon: number, myLink: HTMLElement) {
            let ele = createEle("i", null, null, theme, myLink);
            let i = NAGs[icon] || "";
            ele.setAttribute("data-symbol", i);
            ele.setAttribute("data-value", String(icon));
            ele.textContent = t("nag:$" + icon + "_menu");
          };
          let myLink = createEle("a", null, null, theme, myDiv);
          generateIcon(link, myLink);
          myLink.addEventListener("click", function () {
            function updateMoveSAN(moveIndex: number) {
              let _move = that.mypgn.getMove(moveIndex);
              let _moveSpan: HTMLElement = document.querySelector("#" + id("movesId") + moveIndex);
              clearChilds(_moveSpan);
              regenerateMoveSpan(_moveSpan, _move);
              unmarkMark(moveIndex);
            }

            this.classList.toggle("active");
            let iNode = this.firstChild as HTMLElement;
            that.mypgn.changeNag("$" + iNode.getAttribute("data-value"), that.currentMove, this.classList.contains("active"));
            updateMoveSAN(that.currentMove);
          });
        }
        let myDiv = createEle("div", null, rowClass, theme, nagEle);
        array.forEach((ele) => generateLink(ele, myDiv));
      }
      generateRow([1, 2, 3, 4, 5, 6, 7, 146], "nagMove", nagEle);
      generateRow([10, 13, 14, 15, 16, 17, 18, 19], "nagPosition", nagEle);
      generateRow([22, 40, 36, 132, 136, 32, 44, 140], "nagObservation", nagEle);
    }
    function generateCommentDiv(commentDiv: HTMLElement) {
      const radio = createEle("div", null, "commentRadio", theme, commentDiv);
      const mc: HTMLInputElement = createEle("input", null, "moveComment", theme, radio) as HTMLInputElement;
      mc.type = "radio";
      mc.value = "move";
      mc.name = "radio";
      createEle("label", null, "labelMoveComment", theme, radio).appendChild(document.createTextNode("Move"));
      const ma: HTMLInputElement = createEle("input", null, "afterComment", theme, radio) as HTMLInputElement;
      ma.type = "radio";
      ma.value = "after";
      ma.name = "radio";
      createEle("label", null, "labelAfterComment", theme, radio).appendChild(document.createTextNode("After"));
      createEle("textarea", null, "comment", theme, commentDiv);
      that.mousetrap.stopCallback = function (e, element) {
        return element.tagName === "TEXTAREA";
      };
    }

    const divBoard = document.getElementById(boardId);
    if (divBoard == null) {
      return;
    } else {
      // ensure that the board is empty before filling it
      clearChilds(divBoard);
    }
    that.mousetrap = new Mousetrap(divBoard);
    setBoardClass(theme, Theme);
    divBoard.classList.add("pgnvjs"); // Is used as class for everything included.
    setBoardClass(that.configuration.mode, PgnViewerMode, (m: string) => m + "Mode");
    divBoard.setAttribute("tabindex", "0");
    // Add layout for class if configured
    if (that.configuration.layout) {
      setBoardClass(that.configuration.layout, Layout, (l: string) => "layout-" + l);
    }

    /** Add a drop-down list for all games if necessary. */
    let gamesDropDown = createEle("select", boardId + "Games", "games", null, divBoard);
    if (!that.configuration.manyGames) {
      gamesDropDown.style.display = "none";
    }

    /** Add an error div to show errors */
    that.errorDiv = createEle("div", boardId + "Error", "error", null, divBoard);

    /** outerBoard */
    const outerInnerBoardDiv = createEle("div", null, "outerBoard", null, divBoard);
    let boardAndDiv = createEle("div", null, "boardAnd", theme, outerInnerBoardDiv);

    let topInnerBoardDiv = createEle("div", null, "topInnerBoard", theme, boardAndDiv);
    let blackHeader = createEle("div", id("topHeaderId"), "blackHeader", theme, boardAndDiv);
    let topTime = createEle("span", null, "topTime", theme, topInnerBoardDiv);
    const innerBoardDiv = createEle("div", id("innerBoardId"), "board", theme, boardAndDiv);
    let bottomInnerBoardDiv = createEle("div", null, "bottomInnerBoard", theme, boardAndDiv);
    let whiteHeader = createEle("div", id("bottomHeaderId"), "whiteHeader", theme, boardAndDiv);
    let bottomTime = createEle("div", null, "bottomTime", theme, bottomInnerBoardDiv);

    /** Buttons */
    if (hasMode(PgnViewerMode.View) || hasMode(PgnViewerMode.Edit)) {
      const buttonsBoardDiv = createEle("div", id("buttonsId"), "buttons", theme, divBoard);
      generateViewButtons(buttonsBoardDiv);
      if (that.configuration.colorMarker) {
        createEle("div", id("colorMarkerId"), "colorMarker" + " " + that.configuration.colorMarker, theme, buttonsBoardDiv);
      }
    }
    if (hasMode(PgnViewerMode.Board)) {
      if (that.configuration.colorMarker) {
        createEle("div", id("colorMarkerId"), "colorMarker" + " " + that.configuration.colorMarker, theme, topInnerBoardDiv);
      }
    }
    if (hasMode(PgnViewerMode.Puzzle)) {
      const buttonsBoardDiv = createEle("div", id("buttonsId"), "buttons", theme, divBoard);
      generatePuzzleButtons(buttonsBoardDiv);
    }
    updateUI(null);

    /** Fen */
    if ((hasMode(PgnViewerMode.Edit) || hasMode(PgnViewerMode.View)) && that.configuration.showFen) {
      const fenDiv = createEle("textarea", id("fenId"), "fen", theme, outerInnerBoardDiv);
      addEventListener(id("fenId"), "mousedown", function (e: Event) {
        e.preventDefault();
        this.select();
      });
      if (hasMode(PgnViewerMode.Edit)) {
        document.getElementById(id("fenId")).onpaste = function (e) {
          that.configuration.position = e.clipboardData.getData("text");
          that.configuration.pgn = "";
          pgnEdit(boardId, that.configuration);
        };
      } else {
        let fenele = document.getElementById(id("fenId")) as HTMLTextAreaElement;
        fenele.readOnly = true;
      }
    }

    /** Moves Div */
    if (hasMode(PgnViewerMode.Print) || hasMode(PgnViewerMode.View) || hasMode(PgnViewerMode.Edit) || hasMode(PgnViewerMode.Puzzle)) {
      createEle("div", id("movesId"), "moves " + that.configuration.notationLayout, null, divBoard);
      if (hasMode(PgnViewerMode.Print)) {
        return;
      }
    }

    /** hints Div */
    if (hasMode(PgnViewerMode.Puzzle)) {
      createEle("textarea", id("hintsId"), "hints", null, divBoard);
    }

    /** Edit Divs TODO Redo those */
    if (hasMode(PgnViewerMode.Edit)) {
      const editButtonsDiv = createEle("div", "edit" + id("buttonsId"), "edit", theme, divBoard);
      generateEditButtons(editButtonsDiv);
      let nagMenu = createEle("div", "nagMenu" + id("buttonsId"), "nagMenu", theme, editButtonsDiv);
      generateNagMenu(nagMenu);
      const pgnDiv = createEle("textarea", "textpgn" + id("buttonsId"), "textpgn", theme, editButtonsDiv);
      const commentBoardDiv = createEle("div", "comment" + id("buttonsId"), "comment", theme, editButtonsDiv);
      generateCommentDiv(commentBoardDiv);
      // Bind the paste key ...
      addEventListener("pgn" + id("buttonsId"), "mousedown", function (e: Event) {
        e.preventDefault();
        (e.target as HTMLTextAreaElement).select();
      });
      document.getElementById("textpgn" + id("buttonsId")).onpaste = function (e) {
        that.configuration.pgn = e.clipboardData.getData("text");
        pgnEdit(boardId, that.configuration);
      };
    }
  }

  function adjustFontForCoords(fontSize: number, boardConfig: PgnViewerConfiguration, el: HTMLElement) {
    let right = (fontSize - 13) / 2.5 - 2;
    if (!boardConfig.coordsInner) {
      right -= fontSize / 1.5 + 2;
      let moves = document.getElementById(id("movesId"));
      if (that.configuration.layout === "left") {
        moves.style.marginLeft = `${fontSize / 1.5}px`;
      }
    }
    (el.querySelector("coords.ranks") as HTMLElement).style.right = `${right}px`;
    let bottom: number = fontSize - 13;
    if (!boardConfig.coordsInner) {
      bottom -= fontSize + 2;
      (el.querySelector("coords.files") as HTMLElement).style.left = "0px";
      let buttons = document.getElementById(id("buttonsId"));
      if (buttons) {
        buttons.style.marginTop = `${fontSize * 1.5}px`;
        if (boardConfig.headers) {
          let header = document.getElementById(id("bottomHeaderId"));
          header.style.marginTop = `${fontSize * 1.5}px`;
        }
      }
    }
    (el.querySelector("coords.files") as HTMLElement).style.bottom = `${bottom}px`;
  }

  function recomputeCoordsFonts(boardConfig: PgnViewerConfiguration, el: HTMLElement) {
    if (boardConfig && that.configuration.boardSize) {
      el.style.width = that.configuration.boardSize;
      el.style.height = that.configuration.boardSize;
      let fontSize: number = null;
      if (boardConfig.coordsFontSize) {
        fontSize = Number.parseInt(boardConfig.coordsFontSize);
      } else {
        // Set the font size related to the board (factor 28), ensure at least 8px font
        fontSize = Math.max(8, Math.round((parseInt(that.configuration.boardSize.slice(0, -2)) / 28) * boardConfig.coordsFactor));
      }
      // Adjust the ranks right if necessary
      //el.style.fontSize = `${fontSize}px`
      (el.querySelectorAll("coords") as NodeListOf<HTMLElement>).forEach((element) => {
        element.style.fontSize = `${fontSize}px`;
      });
      if (boardConfig.showCoords) {
        adjustFontForCoords(fontSize, boardConfig, el);
      }
      //document.body.dispatchEvent(new Event('chessground.resize'))
    }
  }

  /**
   * Generate the chess board using the given configuration and unique id.
   */
  function generateBoard() {
    function copyBoardConfiguration(source: PgnViewerConfiguration, target: PgnViewerConfiguration, keys: string[]) {
      keys.forEach(function (key: string) {
        if (typeof source[key] != "undefined") {
          target[key] = source[key];
        }
      });
    }

    function postGenerateBoard() {
      if (that.configuration.startPlay && !that.configuration.hideMovesBefore) {
        let move = that.mypgn.findMove(that.configuration.startPlay);
        if (!move) {
          logError("Could not find startPlay: " + that.configuration.startPlay);
          return;
        }
        makeMove(move.prev, move.index, move.fen);
        unmarkMark(move.index);
      }
    }

    function createPromotionDiv(parent: HTMLElement) {
      function clicked(value: "q" | "r" | "b" | "n") {
        that.configuration.modalClicked(value);
      }
      let _top = createEle("div", boardId + "Prommodal", "swalpgnvroot", null, parent);
      let _b1 = createEle("button", null, "swalpgnv queen", null, _top);
      let _b2 = createEle("button", null, "swalpgnv rook", null, _top);
      let _b3 = createEle("button", null, "swalpgnv bishop", null, _top);
      let _b4 = createEle("button", null, "swalpgnv knight", null, _top);
      that.configuration.modal = new Modaly("#" + boardId + "Prommodal", {
        escape: false,
        overlay: false,
      });
      that.configuration.modal?.hide();
      _b1.addEventListener("click", () => {
        clicked("q");
      });
      _b2.addEventListener("click", () => {
        clicked("r");
      });
      _b3.addEventListener("click", () => {
        clicked("b");
      });
      _b4.addEventListener("click", () => {
        clicked("n");
      });
    }

    // Default values of the board, if not overwritten by the given configuration
    that.boardConfig = { coordsInner: true, coordsFactor: 1.0, drawable: true };
    let chessgroundBoardConfig: Config = {
      disableContextMenu: true,
      movable: that.configuration.movable as Config["movable"],
      drawable: {
        onChange: (shapes) => {
          let move = that.mypgn.getMove(that.currentMove);
          that.mypgn.setShapes(move, shapes as Shape[]);
        },
      },
    };
    let boardConfig = that.boardConfig;
    copyBoardConfiguration(that.configuration, boardConfig, [
      "position",
      "orientation",
      "showCoords",
      "pieceTheme",
      "draggable",
      "coordsInner",
      "coordsFactor",
      "headers",
      "width",
      "movable",
      "viewOnly",
      "highlight",
      "boardSize",
      "coordsFontSize",
      "drawable",
    ]);
    boardConfig.resizable = true;
    if (typeof boardConfig.showCoords != "undefined") {
      chessgroundBoardConfig.coordinates = boardConfig.showCoords;
    }
    if (that.configuration.orientation) {
      chessgroundBoardConfig.orientation = that.configuration.orientation;
    }
    if (!boardConfig.drawable) {
      chessgroundBoardConfig.drawable = { visible: false };
    }
    chessgroundBoardConfig.fen = boardConfig.position;
    const el = document.getElementById(id("innerBoardId"));
    createPromotionDiv(document.getElementById(boardId));
    if (typeof that.configuration.pieceStyle != "undefined") {
      setBoardClass(that.configuration.pieceStyle, PieceStyle);
    }
    if (boardConfig.boardSize) {
      boardConfig.width = boardConfig.boardSize;
    }
    let currentWidth = parseInt(boardConfig.width);
    let moduloWidth = currentWidth % 8;
    let smallerWidth = currentWidth - moduloWidth;
    if (that.configuration.resizable) {
      chessgroundBoardConfig.events = {
        insert(elements) {
          resizeHandle(that, el, el.firstChild as HTMLElement, smallerWidth, resizeLayout);
        },
      };
    }
    // Ensure that boardWidth is a multiply of 8
    // boardConfig.width = "" + smallerWidth +"px"
    that.board = Chessground(el, chessgroundBoardConfig);
    // resizeHandle(that, el, el.firstChild, smallerWidth, resizeLayout)
    //console.log("Board width: " + board.width)
    recomputeCoordsFonts(boardConfig, el);
    if (boardConfig.coordsInner) {
      el.classList.add("coords-inner");
    }
    if (hasMode(PgnViewerMode.Edit)) {
      let _fen = that.mypgn.setToStart();
      let toMove: Color = chess.turn() == "w" ? "white" : "black";
      that.board.set({
        movable: Object.assign({}, that.board.state.movable, {
          color: toMove,
          dests: possibleMoves(_fen),
          showDests: true,
          free: false,
        }),
        turnColor: toMove,
        check: chess.in_check(),
      });
    }

    if (hasMode(PgnViewerMode.Puzzle)) {
      let toMove: Color = chess.turn() == "w" ? "white" : "black";

      let next: PgnReaderMove | undefined = undefined;
      let dests: Map<Field, Field[]> = new Map();

      if (that.mypgn.moves.length > 0) {
        next = that.mypgn.getMove(0);
        dests.set(next.from, [next.to]);
      }

      that.board.set({
        movable: Object.assign({}, { dests: dests }, { color: toMove, showDests: true, free: false }),
        turnColor: toMove,
        check: chess.in_check(),
      });
    }

    if (that.configuration.colorMarker) {
      if (that.configuration.position != "start" && that.configuration.position.split(" ")[1] === "b") {
        let ele = document.getElementById(id("colorMarkerId"));
        if (ele) {
          ele.classList.add("cm-black");
        }
      }
    }
    let gc = that.mypgn.getGameComment();
    if (gc) {
      document.addEventListener("DOMContentLoaded", function () {
        that.board.setShapes(getShapes(gc as any));
      });
    }

    postGenerateBoard();
    return that.board;
  }

  function setBoardClass<E extends Record<string, string>>(val: E[keyof E], type: E, modifier?: (s: string) => string) {
    // By default, the modifier is the identity function
    if (modifier === undefined) {
      modifier = (s: string) => s;
    }

    // Get the board element
    let bel = document.getElementById(boardId);
    bel.classList.add(modifier(val.toString()));

    // Extract the string values from the enum except the selected
    const values = Object.values(type).filter((value) => typeof value === "string" && value !== val.toString()) as string[];

    // Loop over each enum value and remove the class if it exists
    for (const v of values) {
      const mv = modifier(v);
      // Check if the element has a class with the enum value
      if (bel.classList.contains(mv)) {
        bel.classList.remove(mv);
      }
    }
  }

  function moveSpan(i: number) {
    return document.getElementById(id("movesId") + i);
  }

  function regenerateMoveSpan(_moveSpan: HTMLElement, move: PgnReaderMove) {
    // Creating the move SAN including everything (may be recreated later)
    let figclass = that.configuration.figurine ? "figurine " + that.configuration.figurine : null;
    // TODO: The 'san' tag is not valid typed, but how to do that for custom elements
    const _linkEle = createEle("san" as keyof HTMLElementTagNameMap, null, null, null, _moveSpan);
    let _san = "";
    if (hasMode(PgnViewerMode.Puzzle)) {
      _san = that.mypgn.getMove(move.index).notation.notation;
    } else if (move.notation && move.notation.fig) {
      const locale = that.configuration.locale;
      const figurine = that.configuration.figurine;
      const fig = !locale || figurine ? move.notation.fig : t("chess:" + move.notation.fig);
      const figele = createEle("fig" as keyof HTMLElementTagNameMap, null, figclass, null, _linkEle);
      figele.appendChild(document.createTextNode(fig));
      _san = that.mypgn.san(move).substring(1);
    } else {
      _san = that.mypgn.san(move);
    }
    _linkEle.appendChild(document.createTextNode(_san));
    if (move.nag as string[]) {
      move.nag.forEach(function (nag: string) {
        let nagInt = parseInt(nag.substring(1));
        let nagClass = "";
        if (nagInt < 10) {
          nagClass = "move";
        } else if (nagInt > 9 && nagInt < 136) {
          nagClass = "position";
        } else if (nagInt > 135 && nagInt < 140) {
          nagClass = "time";
        }
        let nagele = createEle("nag" as keyof HTMLElementTagNameMap, null, nagClass, null, _linkEle);
        nagele.setAttribute("data-value", nag);
        nagele.setAttribute("title", t("nag:" + nag));
        let nagtext = nagToSymbol([nag]);
        if (nagtext != nag && nagtext) {
          nagele.appendChild(document.createTextNode(nagtext));
          nagele.classList.add("hideaddcontent");
        }
      });
    }
  }

  /**
   * Generates one move from the current position.
   * @param currentCounter the current move counter (should be redundant, because
   *      the move itself should know its move counter)
   * @param game the chess game that helps find the position
   * @param move the current move  generated by reading the PGN (or playing on the board)
   * @param prevCounter the previous counter (have to check that)
   * @param movesDiv the div that contains the current moves
   * @param varStack if empty no current variation (main line), else contains the divs of the variations played currently
   * @return {*} the current counter which may the next prev counter
   */
  function generateMove(currentCounter: number, game: any, move: PgnReaderMove, prevCounter: number, movesDiv: HTMLElement, varStack: HTMLElement[]) {
    function appendVariation(div: HTMLElement, move: PgnReaderMove) {
      // if (! movesDiv.lastChild.classList.contains("variations")) {
      //     movesDiv.appendChild(createEle('div', null, "variations", null, movesDiv))
      // }
      function findLastVariantOfMove(move: PgnReaderMove) {
        let _ind = move.prev ? that.mypgn.getMove(move.prev).next : that.mypgn.getFirstMove().index;
        let _ele = moveSpan(_ind);
        let _next = _ele.nextSibling;
        // @ts-ignore
        while (
          _next &&
          // @ts-ignore
          _next.localName !== "move-number" &&
          // @ts-ignore
          _next.localName !== "move"
        ) {
          // @ts-ignore
          _ele = _next;
          _next = _ele.nextSibling;
        }
        return _ele;
      }
      const preEle = findLastVariantOfMove(move);
      insertAfter(div, preEle);
    }

    function localBoard(id: string, position: string, configuration: PgnViewerConfiguration, blackPerspective: boolean) {
      // Create a deep copy of the configuration
      let newConfig = JSON.parse(JSON.stringify(configuration));

      // Override specific properties
      newConfig = {
        ...newConfig,
        boardSize: "200px",
        resizable: false,
        pgn: "",
        position: position,
        headers: false,
        mode: "board",
        orientation: blackPerspective ? "black" : "white",
        showCoords: false,
      };

      let base = pgnBase(id, newConfig);
      base.generateHTML();
      base.generateBoard();
    }
    function createMoveNumberSpan(currentMove: PgnReaderMove, spanOrDiv: HTMLElement, isVariation: boolean, additionalClass?: string) {
      const mn = currentMove.moveNumber;
      const clazz = additionalClass ? additionalClass : "";
      const num = createEle("move-number" as keyof HTMLElementTagNameMap, null, clazz, null, spanOrDiv);
      num.setAttribute("data-value", String(mn));
      const isList = that.configuration.notationLayout === "list" && !isVariation;
      num.appendChild(document.createTextNode("" + mn + (currentMove.turn == "w" || isList ? ". " : "... ")));
    }

    function isVariant() {
      return varStack.length > 0;
    }
    function currentFather() {
      return isVariant() ? varStack[varStack.length - 1] : movesDiv;
    }
    function preMoveHasVariation(move: PgnReaderMove) {
      let prev = that.mypgn.getMove(move.prev);
      return prev && prev.variations.length > 0;
    }

    // Ignore null moves
    if (move === null || move === undefined) {
      return prevCounter;
    }

    let clAttr = "";
    if (move.variationLevel > 0) {
      clAttr = clAttr + " var var" + move.variationLevel;
    }
    if (move.turn == "w") {
      clAttr = clAttr + " white";
    }
    const _moveSpan = createEle("move" as keyof HTMLElementTagNameMap, id("movesId") + currentCounter, clAttr);
    if (that.mypgn.startVariation(move)) {
      /* if ( (move.turn == 'w') ) {
                createFiller(movesDiv)
            } */
      const varDiv = createEle("div", null, "variation");
      appendVariation(varDiv, move);
      varStack.push(varDiv);
    }
    // Correct varStack, if needed (interactive move)
    if (varStack.length === 0 && move.variationLevel > 0) {
      // Must be a second (or later) move, because start of variation is already managed above.
      // Find the variation div for the previous move (which should be sufficient then)
      varStack.push(moveSpan(that.mypgn.getMove(move.prev).index).parentNode as HTMLElement);
    }
    appendCommentSpan(currentFather(), move.commentMove, "moveComment");

    // When to add a move number
    // Whites move, or at the begin of the main line
    if (move.turn == "w" || that.mypgn.startMainLine(move) || (move.turn === "b" && typeof move.prev !== "number")) {
      createMoveNumberSpan(move, currentFather(), isVariant());
      if (that.mypgn.startMainLine(move) && move.turn === "b" && that.configuration.notationLayout != "inline") {
        createFiller(currentFather());
      }
      // At the beginning of a variation
    } else if (that.mypgn.startVariation(move)) {
      createMoveNumberSpan(move, varStack[varStack.length - 1], true);
      // After the end of a variation, with black to move
    } else if (move.turn == "b" && preMoveHasVariation(move)) {
      createMoveNumberSpan(move, currentFather(), move.variationLevel > 0);
      if (move.variationLevel == 0) {
        createFiller(currentFather());
      }
      // After a comment
    } else if (currentFather().lastElementChild?.classList.toString().match("comment")) {
      createMoveNumberSpan(move, currentFather(), isVariant());
      if (move.turn == "b" && !move.variationLevel) {
        createFiller(currentFather());
      }
    }
    regenerateMoveSpan(_moveSpan, move);

    if (that.configuration.timeAnnotation && move.commentDiag && move.commentDiag.clk) {
      let cl_time = move.commentDiag.clk;
      let cl_class = that.configuration.timeAnnotation?.class || "timeNormal";
      let clock_span = generateCommentSpan(cl_time, cl_class);
      if (that.configuration.timeAnnotation.colorClass) {
        clock_span.style.color = that.configuration.timeAnnotation.colorClass;
      }
      _moveSpan.appendChild(clock_span);
    }
    currentFather().appendChild(_moveSpan);

    appendCommentSpan(currentFather(), move.commentAfter, "afterComment", move.turn == "w" && move.variationLevel == 0);

    if (that.mypgn.endVariation(move)) {
      varStack.pop();
    }
    addEventListener(moveSpan(currentCounter), "click", function (event: Event) {
      makeMove(that.currentMove, currentCounter, move.fen);
      event.stopPropagation();
    });
    if (hasDiagramNag(move)) {
      const diaID = boardId + "dia" + currentCounter;
      const diaDiv = createEle("div", diaID);
      _moveSpan.appendChild(diaDiv);
      localBoard(diaID, move.fen, that.userConfiguration, move.nag.indexOf("$221") > -1);
    }
    //console.log(`FEN size: ${move.fen.length}`)
    return currentCounter;
  }

  /**
   * Unmark all marked moves, mark the next one.
   * @param next the next move number
   */
  function unmarkMark(next: number) {
    function moveASpan(i: number): HTMLElement {
      return document.querySelector("#" + id("movesId") + i + "> san");
    }

    removeClass(document.querySelector("#" + id("movesId") + " san.yellow") as HTMLElement, "yellow");
    addClass(moveASpan(next), "yellow");
  }

  /**
   * Check which buttons should be grayed out
   */
  function updateUI(next: number) {
    const divBoard = document.getElementById(boardId);
    function pgnEmpty() {
      let pgn = that.mypgn.writePgn();
      return typeof pgn === "undefined" || pgn === null || pgn.length === 0;
    }
    let elements: NodeListOf<HTMLElement> = divBoard.querySelectorAll(".pgnvbutton.gray");
    elements.forEach(function (ele) {
      removeClass(ele, "gray");
    });
    const move = that.mypgn.getMove(next);
    if (next === null) {
      ["prev", "first"].forEach(function (name) {
        addClass(divBoard.querySelector("div.buttons > ." + name) as HTMLElement, "gray");
      });
    }
    if ((next !== null && typeof move.next != "number") || pgnEmpty()) {
      ["next", "play", "last"].forEach(function (name) {
        addClass(divBoard.querySelector("div.buttons > ." + name) as HTMLElement, "gray");
      });
    }
    // Update the drop-down for NAGs
    try {
      if (move === undefined || that.configuration.mode !== "edit") {
        return;
      }
      let nagMenu = document.querySelector("#nagMenu" + id("buttonsId"));
      divBoard.querySelectorAll("#nagMenu" + id("buttonsId") + " a.active").forEach(function (act) {
        act.classList.toggle("active");
      });
      let nags: string[] = move.nag || [];
      nags.forEach(function (eachNag) {
        let ele = divBoard.querySelector("#nagMenu" + id("buttonsId") + ' [data-value="' + eachNag.substring(1) + '"]').parentNode as HTMLElement;
        ele.classList.toggle("active");
      });
    } catch (err) {}
  }

  function getShapes(commentDiag: { colorArrows: any; colorFields: any }) {
    function colOfDiag(color: "Y" | "R" | "B" | "G") {
      const colors = { Y: "yellow", R: "red", B: "blue", G: "green" };
      return colors[color];
    }

    let arr = [];
    if (commentDiag !== undefined && commentDiag !== null) {
      if (commentDiag.colorArrows) {
        for (let i = 0; i < commentDiag.colorArrows.length; i++) {
          let comm = commentDiag.colorArrows[i];
          arr.push({
            orig: comm.substring(1, 3),
            dest: comm.substring(3, 5),
            brush: colOfDiag(comm.substring(0, 1)),
          });
        }
      }
      if (commentDiag.colorFields) {
        for (let i = 0; i < commentDiag.colorFields.length; i++) {
          let comm = commentDiag.colorFields[i];
          arr.push({
            orig: comm.substring(1, 3),
            brush: colOfDiag(comm.substring(0, 1)),
          });
        }
      }
    }
    return arr;
  }

  /**
   * Plays the move that is already in the notation on the board.
   * @param curr the current move number
   * @param next the move to take now
   * @param fen the fen of the move to make
   */
  function makeMove(curr: number, next: number, fen: string) {
    /**
     * Fills the comment field depending on which and if a comment is filled for that move.
     */
    function fillComment(moveNumber: number) {
      let myMove = that.mypgn.getMove(moveNumber);
      if (!~myMove) return;
      if (myMove.commentAfter) {
        let ac = document.querySelector("#" + boardId + " input.afterComment") as HTMLInputElement;
        ac.checked = true;
        let tac = document.querySelector("#" + boardId + " textarea.comment") as HTMLTextAreaElement;
        tac.value = myMove.commentAfter;
      } else if (myMove.commentMove) {
        let imc = document.querySelector("#" + boardId + " input.moveComment") as HTMLInputElement;
        imc.checked = true;
        let tac = document.querySelector("#" + boardId + " textarea.comment") as HTMLTextAreaElement;
        if (tac) {
          tac.value = myMove.commentMove;
        }
      } else {
        try {
          let tac = document.querySelector("#" + boardId + " textarea.comment") as HTMLTextAreaElement;
          if (tac) {
            tac.value = "";
          }
        } catch (err) {
          console.log("tac: " + "#" + boardId + " textarea.comment");
          console.log(err);
        }
      }
    }

    function handlePromotion(aMove: PgnReaderMove) {
      if (!aMove) return;
      if (aMove.notation.promotion) {
        let promPiece = aMove.notation.promotion.substring(1, 2).toLowerCase();
        let pieces = new Map();
        pieces[aMove.to] = {
          role: PROMOTIONS[promPiece],
          color: aMove.turn == "w" ? "white" : "black",
        };
        that.board.setPieces(pieces);
      }
    }

    //console.log("Marke move: Curr " + curr + " Next " + next + " FEN " + fen)
    //board.set({fen: fen})
    let myMove = that.mypgn.getMove(next);
    let myFen = myMove ? myMove.fen : fen;
    if (!myFen) {
      // fen not given, take start position
      myFen = that.mypgn.configuration.position == "start" ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" : that.mypgn.configuration.position;
    }
    if (myMove) {
      that.board.set({ fen: myFen, lastMove: [myMove.from, myMove.to] });
    } else {
      that.board.set({ fen: myFen, lastMove: [] });
    }
    handlePromotion(myMove);
    if (myMove) {
      // @ts-ignore
      that.board.setShapes(getShapes(myMove.commentDiag));
    } else {
      let gc = that.mypgn.getGameComment();
      if (gc) {
        // @ts-ignore
        that.board.setShapes(getShapes(gc));
      }
    }
    unmarkMark(next);
    that.currentMove = next;
    if (next && !hasMode(PgnViewerMode.Puzzle)) {
      scrollToView(moveSpan(next));
    } else if (curr && hasMode(PgnViewerMode.Puzzle)) {
      scrollToView(moveSpan(curr));
    }
    if (hasMode(PgnViewerMode.Edit) || hasMode(PgnViewerMode.Puzzle)) {
      chess.load(myFen);
      let col: Color = chess.turn() == "w" ? "white" : "black";
      that.board.set({
        movable: Object.assign({}, that.board.state.movable, {
          color: col,
          dests: possibleMoves(myFen),
          showDests: true,
        }),
        turnColor: col,
        check: chess.in_check(),
      });
      if (next) {
        fillComment(next);
      }
    } else if (hasMode(PgnViewerMode.View)) {
      chess.load(myFen);
      let col: Color = chess.turn() == "w" ? "white" : "black";
      that.board.set({
        movable: Object.assign({}, that.board.state.movable, { color: col }),
        turnColor: col,
        check: chess.in_check(),
      });
    }
    let fenView: HTMLTextAreaElement = document.getElementById(id("fenId")) as HTMLTextAreaElement;
    if (fenView) {
      fenView.value = fen;
    }
    toggleColorMarker(chess.turn());
    resizeLayout();
    updateUI(next);
  }

  function setGameToPosition(pos: string) {
    if (pos == "start" || typeof pos === "undefined") {
      chess.reset();
    } else {
      chess.load(pos);
    }
  }

  /**
   * Regenerate the moves div, may be used the first time (DIV is empty)
   * or later (moves have changed).
   */
  function regenerateMoves(myMoves: PgnReaderMove[]) {
    /* #338 Handle the game comment, if one is there.
     */
    function handleGameComment(movesDiv: HTMLElement, gameComment: GameComment) {
      if (gameComment) {
        appendCommentSpan(movesDiv, gameComment.comment, "moveComment");
      }
    }

    if (hasMode(PgnViewerMode.Puzzle) && that.currentMove == undefined) {
      return;
    }

    const movesDiv = document.getElementById(id("movesId"));
    movesDiv.innerHTML = "";
    let prev = null;
    handleGameComment(movesDiv, that.mypgn.getGameComment());
    const varStack: HTMLElement[] = [];
    let firstMove = 0;
    for (let i = firstMove; i < myMoves.length; i++) {
      if (hasMode(PgnViewerMode.Puzzle) && i > that.currentMove) {
        break;
      }

      if (!that.mypgn.isDeleted(i)) {
        const move = myMoves[i];
        prev = generateMove(move.index, chess, move, prev, movesDiv, varStack);
      }
    }
    if (that.configuration.showResult) {
      // find the result from the header
      let endGame = that.mypgn.getEndGame();
      // Insert it as new span
      let span = createEle("span", id("movesId") + "Result", "move result", theme, document.getElementById(id("movesId")));
      span.innerHTML = endGame ? endGame : "*";
    }
  }

  /**
   * Generates the HTML (for the given moves). Includes the following: move number,
   * link to FEN (position after move)
   */
  function generateMoves() {
    /** Create something printable from the tags for the list. */
    function printTags(game: ParseTree) {
      // @ts-ignore
      if (game.tags.size === 0) {
        return "Should print somehow the moves of the game"; //TODO: What is the idea here? No clue ...
      }
      let _t = game.tags;
      let _date = _t.Date ? _t.Date.value : "??.??.????";
      let _event = _t.Event ? _t.Event : "";
      let _result = _t.Result ? _t.Result : "*";
      let _white = _t.White ? _t.White : "N.N.";
      let _black = _t.Black ? _t.Black : "N.N.";
      return `[${_event}]: ${_white} - ${_black} (${_date}) ${_result}`;
    }
    /** Fill the drop down with loaded game. */
    function fillGamesDropDown() {
      let _games = that.mypgn.getGames();
      let _select = document.getElementById(boardId + "Games") as HTMLSelectElement;
      for (let i = 0; i < _games.length; i++) {
        let _el = document.createElement("option");
        let _game = _games[i];
        _el.text = printTags(_game);
        _el.value = "" + i;
        _select.add(_el);
      }
      _select.addEventListener("change", function (ev) {
        that.mypgn.loadOne(parseInt(_select.value));
        regenerateMoves(that.mypgn.getMoves());
        // bindFunctions()
        generateHeaders();
        makeMove(null, null, null);
      });
    }
    try {
      that.mypgn.loadPgn();
      fillGamesDropDown();
    } catch (err) {
      if (typeof err.location != "undefined") {
        const sta = err.location.start.offset;
        let pgnStr = that.configuration.pgn;
        logError("Offset: " + sta);
        logError("PGN: " + pgnStr);
        logError(err.message);
      } else {
        let pgnStr = that.configuration.pgn;
        logError("PGN: " + pgnStr);
        logError(err);
      }
    }
    let myMoves = that.mypgn.getMoves();
    // Due to possible change in that.mypgn.configuration ...
    that.configuration.position = that.mypgn.configuration.position;
    setGameToPosition(that.configuration.position);
    if (that.board) {
      that.board.set({ fen: chess.fen() });
    }
    let fenField = document.getElementById(id("fenId")) as HTMLTextAreaElement;
    if (isElement(fenField)) {
      fenField.value = chess.fen();
    }

    /**
     * Generate a useful notation for the headers, allow for styling. First a version
     * that just works.
     */
    function generateHeaders() {
      function orientation() {
        return that.board ? that.board.state.orientation : that.configuration.orientation;
      }
      function getTag(tagObject: Tags, key: Partial<TagKeys>): string {
        return tagObject[key];
      }
      let tags = that.mypgn.getTags();
      let whd = orientation() === "white" ? document.getElementById(id("bottomHeaderId")) : document.getElementById(id("topHeaderId"));
      let bhd = orientation() === "white" ? document.getElementById(id("topHeaderId")) : document.getElementById(id("bottomHeaderId"));
      if (that.configuration.headers == false || Object.keys(tags).length === 0) {
        whd?.parentNode.removeChild(whd);
        bhd?.parentNode.removeChild(bhd);
        return;
      }
      if (getTag(tags, "White")) {
        whd.innerHTML = "";
        whd.appendChild(document.createTextNode(getTag(tags, "White") + " "));
      }
      //div_h.appendChild(document.createTextNode(" - "))
      if (getTag(tags, "Black")) {
        bhd.innerHTML = "";
        bhd.appendChild(document.createTextNode(" " + getTag(tags, "Black")));
      }
      // let rest = ""
      // function appendHeader (result, header, separator) {
      //     if (header) {
      //         if (result.length > 0) {
      //             result += separator
      //         }
      //         result += header
      //     }
      //     return result
      // }
      // [tags.Event, tags.Site, tags.Round, tags.Date,
      //     tags.ECO, tags.Result].forEach(function (header) {
      //     rest = appendHeader(rest, header, " | ")
      // })
      // const restSpan = createEle("span", null, "restHeader", theme, div_h)
      // restSpan.appendChild(document.createTextNode(rest))
    }

    // Bind the necessary functions to move the pieces.
    function bindFunctions() {
      function switchHeaderValues() {
        if (!document.getElementById(id("bottomHeaderId"))) return;
        let bottomInner = document.getElementById(id("bottomHeaderId")).innerText;
        let topInner = document.getElementById(id("topHeaderId")).innerText;
        document.getElementById(id("bottomHeaderId")).innerText = topInner;
        document.getElementById(id("topHeaderId")).innerText = bottomInner;
      }
      function bind_key(key: string, to_call: CallableFunction) {
        const form = document.querySelector("#" + boardId + ",#" + boardId + "Moves") as HTMLElement;
        that.mousetrap.bind(
          key,
          function (evt) {
            to_call();
            evt.stopPropagation();
            return true;
          },
          null,
        );
      }
      function nextMove() {
        let fen = null;
        if (typeof that.currentMove == "undefined" || that.currentMove === null) {
          if (that.mypgn.getMoves().length === 0) return false; // no next move
          fen = that.mypgn.getMove(0).fen;
          makeMove(null, 0, fen);
        } else {
          const next = that.mypgn.getMove(that.currentMove).next;
          if (typeof next == "undefined") return false;
          fen = that.mypgn.getMove(next).fen;
          makeMove(that.currentMove, next, fen);
        }
        return true;
      }
      function prevMove() {
        let fen = null;
        if (typeof that.currentMove == "undefined" || that.currentMove == null) {
          /*fen = that.mypgn.getMove(0).fen
                     makeMove(null, 0, fen)*/
        } else {
          const prev = that.mypgn.getMove(that.currentMove).prev;
          if (typeof prev === "undefined" || prev == null) {
            firstMove();
          } else {
            fen = that.mypgn.getMove(prev).fen;
            makeMove(that.currentMove, prev, fen);
          }
        }
      }
      function firstMove() {
        makeMove(null, null, null);
      }

      timer.bind(that.configuration.timerTime, function () {
        nextMove();
      });
      addEventListener(id("buttonsId") + "flipper", "click", function () {
        // TODO The following is a hack to keep the fontSize of the coords.  There is no option in Chessground
        //  to set the font size of coords. See generateBoard for the original setting of font size
        let coordsComp = document.querySelector("#" + boardId).querySelector("coords") as HTMLElement;
        let fs: string;
        if (coordsComp) {
          fs = coordsComp.style.fontSize;
        }
        that.board.toggleOrientation();
        if (coordsComp) {
          document
            .querySelector("#" + boardId)
            .querySelectorAll("coords")
            .forEach((element) => {
              (element as HTMLElement).style.fontSize = fs;
            });
          adjustFontForCoords(parseInt(fs), that.configuration, document.querySelector("#" + boardId));
        }
        switchHeaderValues();
      });
      addEventListener(id("buttonsId") + "next", "click", function () {
        nextMove();
      });
      addEventListener(id("buttonsId") + "prev", "click", function () {
        prevMove();
      });
      addEventListener(id("buttonsId") + "first", "click", function () {
        firstMove();
      });

      addEventListener(id("buttonsId") + "makeMove", "click", function () {
        let next = -1;
        if (typeof that.currentMove == "undefined" || that.currentMove === null) {
          if (that.mypgn.getMoves().length === 0) return; // no next move
          next = 0;
        } else {
          next = that.mypgn.getMove(that.currentMove).next;
          if (typeof next == "undefined") return;
        }
        let myMove = that.mypgn.getMove(next);
        manualMove(myMove.notation["notation"]);
      });

      addEventListener(id("buttonsId") + "showSolution", "click", function () {
        function playMovesToEnd() {
          if (typeof that.currentMove == "undefined" || that.currentMove === null) {
            if (that.mypgn.getMoves().length === 0) {
              movesLeft = false;
              return movesLeft;
            } else {
              next = 0;
              manualMove(that.mypgn.getMove(next).notation["notation"]);
              movesLeft = true;
              return movesLeft;
            }
          } else {
            next = that.mypgn.getMove(that.currentMove).next;
            if (typeof next == "undefined") {
              movesLeft = false;
              return movesLeft;
            } else {
              manualMove(that.mypgn.getMove(next).notation["notation"]);
              movesLeft = true;
              return movesLeft;
            }
          }
        }
        let movesLeft = true;
        let next = -1;

        let nIntervId;
        nIntervId = setInterval(() => {
          movesLeft = playMovesToEnd();
          if (!movesLeft) {
            clearInterval(nIntervId);
          }
        }, 400);
      });

      addEventListener(id("buttonsId") + "getHint", "click", function () {
        const currentFen: string = that.board.getFen();
        if (that.configuration.hints != undefined && that.configuration.hints[currentFen] != undefined) {
          if (that.configuration.hints[currentFen].length > hintsShown) {
            showHint(that.configuration.hints[currentFen][hintsShown]);
          } else if (that.configuration.hints[currentFen].length == hintsShown) {
            showHint("No more hints");
          }
        } else if (hintsShown == 0) {
          showHint("There are no hints");
        }
      });

      function lastMove() {
        let moved = false;
        do {
          moved = nextMove();
        } while (moved);
      }

      addEventListener(id("buttonsId") + "last", "click", function () {
        lastMove();
      });
      function togglePgn() {
        const pgnButton = document.getElementById(id("buttonsId") + "pgn");
        const pgnText = document.getElementById(boardId + " .textpgn");
        document.getElementById(id("buttonsId") + "pgn").classList.toggle("selected");
        const textPgn = document.querySelector("#" + boardId + " .textpgn") as HTMLElement;
        if (document.getElementById(id("buttonsId") + "pgn").classList.contains("selected")) {
          const str = computePgn();
          showPgn(str);
          textPgn.style.display = "block"; //slideDown(700, "linear")
        } else {
          textPgn.style.display = "none";
        }
      }
      function toggleNagMenu() {
        let nagMenu = document.getElementById(id("buttonsId") + "nags").classList.toggle("selected");
        if (document.getElementById(id("buttonsId") + "nags").classList.contains("selected")) {
          document.getElementById("nagMenu" + id("buttonsId")).style.display = "flex";
        } else {
          document.getElementById("nagMenu" + id("buttonsId")).style.display = "none";
        }
      }
      if (hasMode(PgnViewerMode.Edit)) {
        // only relevant functions for edit mode
        addEventListener(id("buttonsId") + "pgn", "click", function () {
          togglePgn();
        });
        addEventListener(id("buttonsId") + "nags", "click", function () {
          toggleNagMenu();
        });
        addEventListener(id("buttonsId") + "deleteMoves", "click", function () {
          const prev = that.mypgn.getMove(that.currentMove).prev;
          const fen = that.mypgn.getMove(prev).fen;
          that.mypgn.deleteMove(that.currentMove);
          //document.getElementById(id('movesId')).innerHtml = ""
          let myNode = document.getElementById(id("movesId"));
          while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
          }
          regenerateMoves(that.mypgn.getMoves());
          makeMove(null, prev, fen);
        });
        addEventListener(id("buttonsId") + "promoteVar", "click", function () {
          let curr = that.currentMove;
          that.mypgn.promoteMove(that.currentMove);
          //document.getElementById(id('movesId')).html("")
          let myNode = document.getElementById(id("movesId"));
          while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
          }
          regenerateMoves(that.mypgn.getOrderedMoves(that.mypgn.getFirstMove(), []));
          let fen = that.mypgn.getMove(curr).fen;
          makeMove(null, that.currentMove, fen);
        });
        let textPgn = document.querySelector("#" + boardId + " .textpgn") as HTMLElement;
        textPgn.style.display = "none";
        let tac = document.querySelector("#comment" + id("buttonsId") + " textarea.comment") as HTMLTextAreaElement;
        tac.onchange = function () {
          function commentText() {
            return " " + tac.value + " ";
          }

          let text = commentText();
          let checkedElement = document.querySelector("#" + "comment" + id("buttonsId") + " :checked");
          let checked = checkedElement ? (checkedElement as HTMLTextAreaElement).value : "after";
          let currentEle = moveSpan(that.currentMove);
          let nextEle = currentEle.nextElementSibling;
          if (!nextEle) {
            const span = createEle("span", null, "comment " + checked);
            span.appendChild(document.createTextNode(" " + text + " "));
            currentEle.parentNode.appendChild(span);
          } else if (nextEle.classList.length > 0 && nextEle.classList[0] == "comment") {
            nextEle.textContent = text;
          } else {
            const span = createEle("span", null, "comment " + checked);
            span.appendChild(document.createTextNode(" " + text + " "));
            nextEle.parentNode.insertBefore(span, nextEle);
          }
          if (checked === "after") {
            that.mypgn.getMove(that.currentMove).commentAfter = text;
          } else if (checked === "move") {
            that.mypgn.getMove(that.currentMove).commentMove = text;
          }
        };
        const rad = ["moveComment", "afterComment"];
        for (let i = 0; i < rad.length; i++) {
          let cb = document.querySelector("#" + "comment" + id("buttonsId") + " ." + rad[i]) as HTMLInputElement;
          cb.onclick = function () {
            const checked = (this as HTMLInputElement).value;
            let text;
            if (checked === "after") {
              text = that.mypgn.getMove(that.currentMove).commentAfter;
            } else if (checked === "move") {
              text = that.mypgn.getMove(that.currentMove).commentMove;
            }
            let btac = document.querySelector("#" + boardId + " textarea.comment") as HTMLTextAreaElement;
            btac.value = text;
          };
        }
      }

      function togglePlay() {
        if (timer.running()) {
          timer.stop();
        } else {
          timer.start();
        }
        const playButton = document.getElementById(id("buttonsId") + "play");
        let clString = (playButton.childNodes[0] as HTMLElement).getAttribute("class");
        if (clString.indexOf("play") < 0) {
          // has the stop button
          clString = clString.replace(/pause/g, "play");
        } else {
          clString = clString.replace(/play/g, "pause");
        }
        (playButton.childNodes[0] as HTMLElement).setAttribute("class", clString);
      }

      bind_key("left", prevMove);
      bind_key("right", nextMove);
      bind_key("home", firstMove);
      bind_key("end", lastMove);
      bind_key("space", togglePlay); // Has to ensure, that in text fields (like comment, potentially others)
      // mousetrap is not active
      addEventListener(id("buttonsId") + "play", "click", function () {
        togglePlay();
      });
    }

    function computePgn() {
      return that.mypgn.writePgn();
    }

    function showPgn(val: string) {
      document.getElementById("textpgn" + id("buttonsId")).textContent = val;
    }

    regenerateMoves(myMoves);
    bindFunctions();
    generateHeaders();

    /**
     * Allows to add functions after having generated the moves. Used currently for setting start position.
     */
    function postGenerateMoves() {
      updateUI(null);
    }
    postGenerateMoves();
    resizeLayout();
  }
  function resizeLayout() {
    const divBoard = document.getElementById(boardId);
    function hasHeaders() {
      return that.configuration.headers && Object.keys(that.mypgn.getTags()).length > 0;
    }

    function computeBoardSize() {
      function setBoardSizeAndWidth(boardSize: string, width: string) {
        that.configuration.boardSize = boardSize;
        that.configuration.width = width;
        divBoard.style.width = width;
      }
      let _boardSize = that.configuration.boardSize;
      let _width = that.configuration.width || divBoard.style.width;

      function getRoundedBoardSize(_boardSize: string) {
        return `${Math.round(parseInt(_boardSize) / 8) * 8}px`;
      }

      if (that.configuration.layout === "top" || that.configuration.layout === "bottom") {
        if (_boardSize) {
          let rounded = getRoundedBoardSize(_boardSize);
          setBoardSizeAndWidth(rounded, rounded);
          return _boardSize;
        } else {
          _width = _width || "320px";
          _width = getRoundedBoardSize(_width);
          setBoardSizeAndWidth(_width, _width);
          return _width;
        }
      }
      // Layout left or right, more complex combinations possible
      if (!_boardSize && !_width) {
        _boardSize = "320px";
      }
      if (_boardSize && _width) {
        _boardSize = getRoundedBoardSize(_boardSize);
        setBoardSizeAndWidth(_boardSize, _width);
        return _boardSize;
      } else if (!_boardSize) {
        _boardSize = getRoundedBoardSize(String((parseInt(_width) / 8) * 5));
        setBoardSizeAndWidth(_boardSize, _width);
        return _boardSize;
      } else {
        _width = `${(parseInt(_boardSize) / 5) * 8}px`;
        setBoardSizeAndWidth(_boardSize, _width);
        return _boardSize;
      }
    }

    // console.log("Start computing layout")
    let _boardHeight = computeBoardSize();
    let _boardWidth = _boardHeight;
    // console.log("Board size: " + _boardWidth)

    if (hasMode(PgnViewerMode.Board)) {
      if (document.getElementById(id("colorMarkerId"))) {
        document.getElementById(id("colorMarkerId")).style.marginLeft = "auto";
      }
      return;
    }
    if (hasMode(PgnViewerMode.Print)) return;

    // View and edit mode
    if (!hasMode(PgnViewerMode.Puzzle)) {
      let _buttonFontSize = Math.max(10, parseInt(_boardHeight) / 24);
      let _buttonsHeight = document.getElementById(id("buttonsId")).offsetHeight;
      if (_buttonsHeight < 20) {
        _buttonsHeight += _buttonFontSize;
      }
      if (document.getElementById(id("buttonsId"))) {
        document.getElementById(id("buttonsId")).style.fontSize = `${_buttonFontSize}px`;
      }
      if (that.configuration.showFen) {
        let _fenHeight = document.getElementById(id("fenId")).offsetHeight;
        _boardHeight = `${parseInt(_boardHeight) + _fenHeight}px`;
      }
      if (hasHeaders()) {
        _boardHeight = `${parseInt(_boardHeight) + 40}px`;
      }

      let _gamesHeight = that.configuration.manyGames ? "40px" : "0";
      if (that.configuration.layout === "left" || that.configuration.layout === "right") {
        divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(auto, ${_boardHeight}) ${_buttonsHeight}px`;
        let _movesWidth;
        if (that.configuration.movesWidth) {
          _movesWidth = that.configuration.movesWidth;
        } else {
          _movesWidth = `${parseInt(that.configuration.width) - parseInt(_boardWidth)}px`;
        }
        if (that.configuration.layout === "left") {
          divBoard.style.gridTemplateColumns = _boardWidth + " " + _movesWidth;
        } else {
          divBoard.style.gridTemplateColumns = _movesWidth + " " + _boardWidth;
        }
      } else {
        let _movesHeight;
        if (that.configuration.movesHeight) {
          _movesHeight = parseInt(that.configuration.movesHeight);
        } else {
          let _movesCount = that.mypgn.getMoves().length;
          let _maxMovesHeight = (parseInt(_boardHeight) / 5) * 3;
          _movesHeight = Math.min(((_movesCount + 20) / 7) * 19, _maxMovesHeight);
        }

        if (that.configuration.layout === "top") {
          divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(auto, ${_boardHeight}) auto minmax(0, ${_movesHeight}px) auto`;
        } else if (that.configuration.layout === "bottom") {
          divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(0,${_movesHeight}px) minmax(auto,${_boardHeight}) auto`;
        }
        divBoard.style.gridTemplateColumns = _boardWidth;
      }
      recomputeCoordsFonts(that.boardConfig, document.getElementById(id("innerBoardId")));
    } else {
      //puzzle mode
      let _gamesHeight = that.configuration.manyGames ? "40px" : "0";
      let _movesHeight: number;
      if (that.configuration.movesHeight) {
        _movesHeight = parseInt(that.configuration.movesHeight);
      } else {
        let _movesCount = that.mypgn.getMoves().length;
        let _maxMovesHeight = (parseInt(_boardHeight) / 5) * 3;
        _movesHeight = Math.min(((_movesCount + 20) / 7) * 19, _maxMovesHeight);
      }

      if (that.configuration.layout === "top") {
        divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(auto, ${_boardHeight}) auto minmax(0, ${_movesHeight}px) auto`;
      } else if (that.configuration.layout === "bottom") {
        divBoard.style.gridTemplateRows = `${_gamesHeight} auto minmax(0,${_movesHeight}px) minmax(auto,${_boardHeight}) auto`;
      }
      divBoard.style.gridTemplateColumns = _boardWidth;

      recomputeCoordsFonts(that.boardConfig, document.getElementById(id("innerBoardId")));
    }
  }

  /**
   * Allow to programatically make move `n` of the main line on the board.
   * @param n - the move number to jump to.
   */
  function jumpToMove(n: number) {
    // Something
    let fen = that.mypgn.getMoves()[n].fen;
    that.board.set({ fen: fen });
  }

  /**
   * Allow to programatically stop the timer
   */
  function stop() {
    if (timer.running()) {
      timer.stop();
    }
  }

  return {
    // PUBLIC API
    chess: chess,
    board: that.board,
    getPgn: function () {
      return that.mypgn;
    },
    generateHTML: generateHTML,
    generateBoard: generateBoard,
    generateMoves: generateMoves,
    manualMove: manualMove,
    jumpToMove: jumpToMove,
    onSnapEnd: onSnapEnd,
    resizeLayout: resizeLayout,
    t: t,
    stop: stop,
  };
};

export { pgnBase };
