import {
  LETTER_REG,
  NEW_LINE_REG,
  NUMBER_REG,
  WHITE_SPACE_REG,
} from '../config/reg'

/**
 * 是否是空格1
 * @param char
 */
export function isWhiteSpace(char: string) {
  return WHITE_SPACE_REG.test(char)
}

/**
 * 是否是 数字 | 字符串 | 下划线
 * @param char
 */
export function isLetter(char: string) {
  return LETTER_REG.test(char)
}

/**
 * 是否是换行符
 * @param char
 */
export function isNewLine(char: string) {
  return NEW_LINE_REG.test(char)
}

/**
 * 是否是数字
 * @param char
 */
export function isNumber(char: string) {
  return NUMBER_REG.test(char)
}
