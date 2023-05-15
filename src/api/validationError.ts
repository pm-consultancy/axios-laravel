import { ServerErrors } from "@vuelidate/core";
import { camelizeKeys } from "humps";

export class ValidationError {
  public errors: Map<string, string[]>

  public parseDotNotation (str: string, val: string[], obj: Record<string, any>) {
    let currentObj = obj
    const keys = str.split('.')
    let i
    const l = keys.length - 1

    if (l > 0) {
      let key

      for (i = 0; i < l; ++i) {
        key = keys[i]
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        currentObj[key] = currentObj[key] || {}
        currentObj = currentObj[key]
      }

      currentObj[keys[i]] = val
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete obj[str]
    }
  }

  public toExternalResults (): ServerErrors {
    const fromEntries = Object.fromEntries(this.errors)
    for (const key in fromEntries) {
      this.parseDotNotation(key, fromEntries[key], fromEntries)
    }

    return camelizeKeys(fromEntries) as ServerErrors

    // return camelizeKeys(Object.fromEntries(this.errors))
  }

  public toExternalResultsKeyed (key: string): ServerErrors {
    const obj: Record<string, any> = {}
    obj[key] = this.toExternalResults()
    return obj
  }

  constructor (errors: Record<string, any>) {
    this.errors = new Map(Object.entries(errors))
  }
}
