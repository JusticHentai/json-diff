import TupleToUnion from '@justichentai/types-utils/src/TupleToUnion'
import KEY_TOKENS, { KeyToken } from './config/tokenKey'
import TOKEN_MAP from './config/tokenMap'
import Token from './types/Token'
import { isLetter, isNewLine, isNumber, isWhiteSpace } from './utils/is'

export default class Lexer {
  curIndex = 0 // 当前 index
  nextIndex = -1 // 下一个 index
  curChar: string // 当前字符串
  json: string
  tokens: Token[] = [] // token 列表

  constructor(json: string) {
    // 初始化 curChar
    this.curChar = json.charAt(this.curIndex)
    this.json = json

    this.walk()
  }

  /**
   * 遍历字符串并解析
   */
  walk() {
    while (!this.isEnd()) {
      // 先消耗空白符
      this.parseWhitespace()

      let token: Token

      switch (this.curChar) {
        case TOKEN_MAP.openBrace:
        case TOKEN_MAP.closeBrace:
        case TOKEN_MAP.openBracket:
        case TOKEN_MAP.closeBracket:
        case TOKEN_MAP.colon:
        case TOKEN_MAP.comma:
          token = { type: this.curChar, value: this.curChar }
          this.consume(1)
          break
        case TOKEN_MAP.singleSlash:
          this.consume(1)
          this.parseComment()
          break
        case TOKEN_MAP.quote:
          this.consume(1)
          this.parseString()
          break
        default:
          token = this.parseKeyword() || this.parseNumber()
          if (!token) {
            throw new Error(`${this.curChar} is not a valid type`)
          }
      }
      token && this.tokens.push(token)
    }
  }

  /**
   * 是否解析完成
   */
  isEnd(): boolean {
    return this.curIndex >= this.json.length
  }

  /**
   * 消耗字符串 返回下一个字符串
   * @param step
   */
  consume(step: number) {
    if (this.isEnd()) {
      return
    }

    this.curIndex += step
    this.curChar = this.json.charAt(this.curIndex)
  }

  next() {
    return this.nextIndex < this.tokens.length
      ? this.tokens[++this.nextIndex]
      : null
  }

  /**
   * 解析空白符
   */
  parseWhitespace() {
    // 循环消耗 直到下一个不是空白符
    while (!this.isEnd() && isWhiteSpace(this.curChar)) {
      // 消耗一个空白符
      this.consume(1)
    }
  }

  /**
   * 解析字符串
   */
  parseString() {
    let buffer = ''

    while (!this.isEnd()) {
      switch (this.curChar) {
        case TOKEN_MAP.bitOr:
          buffer && this.tokens.push({ type: TOKEN_MAP.string, value: buffer })

          this.tokens.push({
            type: TOKEN_MAP.bitOr,
            value: TOKEN_MAP.bitOr,
          })

          buffer = ''

          break
        case TOKEN_MAP.quote:
          buffer && this.tokens.push({ type: TOKEN_MAP.string, value: buffer })

          this.consume(1)

          return
        default:
          if (isLetter(this.curChar)) {
            buffer += this.curChar
          } else {
            throw new Error(`${this.curChar} is not a valid token`)
          }
      }

      this.consume(1)
    }
  }

  /**
   * 解析标识符
   */
  parseKeyword() {
    let buffer = ''

    KEY_TOKENS.some((name: TupleToUnion<KeyToken>) => {
      const key = this.json.substring(
        this.curIndex,
        this.curIndex + name.length - 1
      )

      if (key !== name) {
        return false
      }

      buffer = name
      this.consume(name.length)

      return true
    })

    return buffer
      ? { type: TOKEN_MAP.identifier, value: JSON.parse(buffer) }
      : null
  }

  /**
   * 解析数字
   */
  parseNumber() {
    let buffer = ''

    while (!this.isEnd() && isNumber(this.curChar)) {
      buffer += this.curChar

      this.consume(1)
    }

    return buffer ? { type: TOKEN_MAP.number, value: +buffer } : null
  }

  /**
   * 解析注释
   */
  parseComment() {
    if (this.json.charAt(this.curIndex) !== TOKEN_MAP.singleSlash) {
      throw new Error(`${this.curChar} is not matched /`)
    }

    this.consume(1)
    this.parseWhitespace()

    let buffer = ''

    while (!this.isEnd() && !isNewLine(this.curChar)) {
      buffer += this.curChar

      this.consume(1)
    }

    buffer && this.tokens.push({ type: TOKEN_MAP.comment, value: buffer })
  }
}
