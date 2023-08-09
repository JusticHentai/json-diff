import TokenMap from '../config/tokenMap'

export default interface Token {
  type: `${TokenMap}`
  value: string | null
}
