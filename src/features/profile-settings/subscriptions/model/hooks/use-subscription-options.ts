import { useMemo } from "react"
import { PaymentsProductsResponse } from "../types"

export const useSubscriptionOptions = (productsData: PaymentsProductsResponse | undefined) => {
  return useMemo(() => {
    if (!productsData?.items) return []
    return productsData.items.map((item) => {
      const priceInDollars = item.amountMinor / 100
      return {
        label: `${priceInDollars}$ per ${item.billingIntervalCount} ${item.billingInterval}`,
        value: item.productId || "",
      }
    })
  }, [productsData])
}
