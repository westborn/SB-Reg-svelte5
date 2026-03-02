import { SquareClient, SquareEnvironment, SearchOrdersSortField, SortOrder } from 'square'

const DEFAULT_ORDER_LIMIT = 100

/**
 * SquareOrderChecker usage guide
 *
 * Required environment variables (if constructor args are not provided):
 * - SQUARE_ACCESS_TOKEN (required): Square API access token
 * - SQUARE_ENVIRONMENT (optional): "production" or anything else (defaults to Sandbox)
 *
 * Inputs:
 * - getOrderSummaryByDateRange(startDate: Date, endDate: Date)
 *   Expects JavaScript Date objects representing the date/time range to query.
 *
 * Output:
 * - Promise<ApiResult<OrderSummaryRow[]>>
 *   Returns [error, result]
 *   - error: { status: number; message: string } | null
 *   - result: OrderSummaryRow[] | null
 *   When successful, result returns one row per order line item with these fields:
 *   - location: string
 *   - state: string
 *   - createdDateTime: Date
 *   - orderAmountCents: number (whole cents; only shown on first line per order)
 *   - orderLine: number (1-based line item index)
 *   - item: string
 *   - sku: string
 *   - quantity: number
 *   - baseAmountCents: number (whole cents)
 */

export interface Money {
  amount: bigint | number | string
  currency: string
}

export interface FormattedLineItem {
  name?: string
  quantity?: string
  totalMoney?: Money | null
  catalogObjectId?: string
  catalogVersion?: bigint | number | string | null
}

export interface FormattedOrder {
  id: string
  locationId?: string
  state: string
  createdAt: string
  totalMoney: Money | null
  lineItems: FormattedLineItem[]
}

export interface LocationMap {
  [key: string]: string
}

export interface SquareLocation {
  id?: string
  name?: string | null
}

export interface SquareLineItem {
  name?: string
  quantity?: string
  totalMoney?: Money | null
  total_money?: Money | null
  basePriceMoney?: Money | null
  base_price_money?: Money | null
  catalogObjectId?: string
  catalog_object_id?: string
  catalogVersion?: bigint | number | string | null
  catalog_version?: bigint | number | string | null
}

export interface SquareOrder {
  id?: string
  locationId?: string
  state?: string
  createdAt?: string
  updatedAt?: string
  totalMoney?: Money | null
  lineItems?: SquareLineItem[]
  line_items?: SquareLineItem[]
}

interface CatalogMetadata {
  sku: string | null
}

export interface OrderSummaryRow {
  location: string
  state: string
  createdDateTime: Date
  orderAmountCents: number
  orderLine: number
  item: string
  sku: string
  quantity: number
  baseAmountCents: number
}

export interface ApiError {
  status: number
  message: string
}

export type ApiResult<T> = [ApiError | null, T | null]

export default class SquareOrderChecker {
  private readonly client: SquareClient | null
  private readonly ordersApi: SquareClient['orders'] | null
  private readonly locationsApi: SquareClient['locations'] | null
  private readonly catalogApi: SquareClient['catalog'] | null
  private readonly initError: ApiError | null
  private readonly catalogMetadataCache = new Map<string, Promise<CatalogMetadata>>()
  private locationMapPromise: Promise<LocationMap> | null = null

  /**
   * Create a checker instance.
   *
   * @param accessToken Optional explicit Square access token. If omitted, uses SQUARE_ACCESS_TOKEN.
   * @param environment Optional explicit environment string. If omitted, uses SQUARE_ENVIRONMENT.
   */
  constructor(accessToken = process.env.SQUARE_ACCESS_TOKEN, environment = process.env.SQUARE_ENVIRONMENT) {
    if (!accessToken) {
      this.client = null
      this.ordersApi = null
      this.locationsApi = null
      this.catalogApi = null
      this.initError = { status: 401, message: 'SQUARE_ACCESS_TOKEN environment variable is not set' }
      return
    }

    this.client = new SquareClient({
      token: accessToken,
      environment: environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    })

    this.ordersApi = this.client.orders
    this.locationsApi = this.client.locations
    this.catalogApi = this.client.catalog
    this.initError = null
  }

  private createApiError(status: number, message: string): ApiError {
    return { status, message }
  }

  private toApiError(error: any, fallbackStatus: number, fallbackMessage: string): ApiError {
    const status =
      typeof error?.statusCode === 'number'
        ? error.statusCode
        : typeof error?.status === 'number'
          ? error.status
          : fallbackStatus

    const squareMessage =
      typeof error?.errors?.[0]?.detail === 'string'
        ? error.errors[0].detail
        : typeof error?.errors?.[0]?.category === 'string'
          ? error.errors[0].category
          : undefined

    const rawMessage = squareMessage || (typeof error?.message === 'string' ? error.message : '') || fallbackMessage

    return this.createApiError(status, rawMessage)
  }

  private formatDateToRFC3339(date: Date): string {
    return date.toISOString()
  }

  private toCents(money: Money | null | undefined): number {
    if (!money) {
      return 0
    }

    const amount = Number(money.amount)
    return Number.isFinite(amount) ? amount : 0
  }

  private buildLocationMap(locations: SquareLocation[]): LocationMap {
    return locations.reduce((map: LocationMap, location) => {
      if (location.id) {
        map[location.id] = location.name || location.id
      }

      return map
    }, {})
  }

  private normalizeLineItem(item: SquareLineItem): FormattedLineItem {
    return {
      name: item.name,
      quantity: item.quantity,
      totalMoney: item.totalMoney || item.total_money || item.basePriceMoney || item.base_price_money || null,
      catalogObjectId: item.catalogObjectId || item.catalog_object_id || undefined,
      catalogVersion: item.catalogVersion || item.catalog_version || null,
    }
  }

  private normalizeOrder(order: SquareOrder): FormattedOrder {
    return {
      id: order.id || 'N/A',
      locationId: order.locationId,
      state: order.state || 'UNKNOWN',
      createdAt: order.createdAt || new Date(0).toISOString(),
      totalMoney: order.totalMoney
        ? {
            amount: order.totalMoney.amount,
            currency: order.totalMoney.currency,
          }
        : null,
      lineItems: (order.lineItems || order.line_items || []).map((item) => this.normalizeLineItem(item)),
    }
  }

  private extractOrders(response: any): SquareOrder[] {
    if (Array.isArray(response?.orders)) {
      return response.orders
    }

    if (Array.isArray(response?.result?.orders)) {
      return response.result.orders
    }

    if (Array.isArray(response?.result?.body?.orders)) {
      return response.result.body.orders
    }

    return []
  }

  private extractCursor(response: any): string | undefined {
    if (typeof response?.cursor === 'string' && response.cursor.length > 0) {
      return response.cursor
    }

    if (typeof response?.result?.cursor === 'string' && response.result.cursor.length > 0) {
      return response.result.cursor
    }

    return undefined
  }

  private async getLocationMap(): Promise<ApiResult<LocationMap>> {
    if (!this.locationMapPromise) {
      const [locationsError, locations] = await this.getAllLocations()
      if (locationsError || !locations) {
        return [locationsError || this.createApiError(500, 'Failed to load locations'), null]
      }

      this.locationMapPromise = Promise.resolve(this.buildLocationMap(locations))
    }

    const map = await this.locationMapPromise
    return [null, map]
  }

  private toBigInt(value: bigint | number | string | null | undefined): bigint | undefined {
    if (value === null || value === undefined) {
      return undefined
    }

    if (typeof value === 'bigint') {
      return value
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return undefined
      }

      return BigInt(Math.trunc(value))
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length === 0) {
        return undefined
      }

      try {
        return BigInt(trimmed)
      } catch {
        return undefined
      }
    }

    return undefined
  }

  private extractSku(payload: any): string | null {
    const rawSku =
      payload?.object?.itemVariationData?.sku ??
      payload?.object?.item_variation_data?.sku ??
      payload?.object?.variationData?.sku ??
      payload?.object?.variation_data?.sku

    if (typeof rawSku !== 'string') {
      return null
    }

    const sku = rawSku.trim()
    return sku.length > 0 ? sku : null
  }

  private async getCatalogObjectPayload(
    objectId: string,
    catalogVersion?: bigint | number | string | null,
  ): Promise<any | null> {
    try {
      if (!this.catalogApi) {
        return null
      }

      const version = this.toBigInt(catalogVersion)
      const response = (await this.catalogApi.object.get({
        objectId,
        includeRelatedObjects: false,
        includeCategoryPathToRoot: false,
        catalogVersion: version,
      })) as any

      if (response?.object) {
        return response
      }

      if (response?.result?.object) {
        return response.result
      }

      if (response?.result?.body?.object) {
        return response.result.body
      }

      return null
    } catch {
      return null
    }
  }

  private async getCatalogMetadataForLineItem(lineItem: FormattedLineItem): Promise<CatalogMetadata> {
    const catalogObjectId = lineItem.catalogObjectId
    if (!catalogObjectId) {
      return { sku: null }
    }

    const cacheKey = `${catalogObjectId}:${String(lineItem.catalogVersion ?? '')}`
    const cached = this.catalogMetadataCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const metadataPromise = (async () => {
      const variationPayload = await this.getCatalogObjectPayload(catalogObjectId, lineItem.catalogVersion)
      if (!variationPayload) {
        return { sku: null }
      }

      const sku = this.extractSku(variationPayload)
      return { sku }
    })()

    this.catalogMetadataCache.set(cacheKey, metadataPromise)
    return metadataPromise
  }

  async getAllLocations(): Promise<ApiResult<SquareLocation[]>> {
    try {
      if (this.initError) {
        return [this.initError, null]
      }

      if (!this.locationsApi) {
        return [this.createApiError(500, 'Locations API client is not initialized'), null]
      }

      const response = await this.locationsApi.list()

      if (Array.isArray(response?.locations)) {
        return [null, response.locations.filter((location: SquareLocation) => location.id)]
      }

      return [null, []]
    } catch (error) {
      return [this.toApiError(error, 502, 'Failed to fetch locations from Square API'), null]
    }
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<ApiResult<SquareOrder[]>> {
    try {
      if (this.initError) {
        return [this.initError, null]
      }

      if (!this.ordersApi) {
        return [this.createApiError(500, 'Orders API client is not initialized'), null]
      }

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return [this.createApiError(400, 'Invalid date range provided'), null]
      }

      if (startDate > endDate) {
        return [this.createApiError(400, 'startDate must be before or equal to endDate'), null]
      }

      const [locationError, locations] = await this.getAllLocations()
      if (locationError || !locations) {
        return [locationError || this.createApiError(500, 'Failed to fetch locations'), null]
      }

      if (locations.length === 0) {
        return [null, []]
      }

      const locationIds = locations.map((location) => location.id).filter((id): id is string => Boolean(id))

      if (locationIds.length === 0) {
        return [null, []]
      }

      const allOrders: SquareOrder[] = []
      let cursor: string | undefined

      do {
        const requestPayload = {
          locationIds,
          query: {
            filter: {
              dateTimeFilter: {
                createdAt: {
                  startAt: this.formatDateToRFC3339(startDate),
                  endAt: this.formatDateToRFC3339(endDate),
                },
              },
            },
            sort: {
              sortField: SearchOrdersSortField.CreatedAt,
              sortOrder: SortOrder.Asc,
            },
          },
          limit: DEFAULT_ORDER_LIMIT,
          cursor,
        }

        const response = await this.ordersApi.search(requestPayload)
        allOrders.push(...this.extractOrders(response))
        cursor = this.extractCursor(response)
      } while (cursor)

      const deduped = new Map<string, SquareOrder>()
      for (const order of allOrders) {
        if (order.id) {
          deduped.set(order.id, order)
        }
      }

      return [null, [...deduped.values()]]
    } catch (error) {
      return [this.toApiError(error, 502, 'Failed to fetch orders from Square API'), null]
    }
  }

  async buildOrderSummary(orders: SquareOrder[]): Promise<ApiResult<OrderSummaryRow[]>> {
    const [locationMapError, locationMap] = await this.getLocationMap()
    if (locationMapError || !locationMap) {
      return [locationMapError || this.createApiError(500, 'Failed to build location map'), null]
    }

    const formattedOrders = orders.map((order) => this.normalizeOrder(order))

    const rows: OrderSummaryRow[] = []

    for (const order of formattedOrders) {
      const baseOrderData = {
        location: locationMap[order.locationId!] || order.locationId || 'N/A',
        state: order.state,
        createdDateTime: new Date(order.createdAt),
      }

      if (order.lineItems.length === 0) {
        continue
      }

      let amountShown = false

      for (let index = 0; index < order.lineItems.length; index += 1) {
        const lineItem = order.lineItems[index]
        const { sku } = await this.getCatalogMetadataForLineItem(lineItem)

        rows.push({
          ...baseOrderData,
          orderAmountCents: !amountShown ? this.toCents(order.totalMoney) : 0,
          orderLine: index + 1,
          item: lineItem.name || 'Unknown Item',
          sku: sku || 'Not Art',
          quantity: Number(lineItem.quantity ?? '1') || 1,
          baseAmountCents: this.toCents(lineItem.totalMoney),
        })

        amountShown = true
      }
    }

    return [null, rows]
  }

  /**
   * Fetch orders for a date range and transform them into summary rows.
   *
   * @param startDate Inclusive start of the query window.
   * @param endDate Inclusive end of the query window.
   * @returns Promise<ApiResult<OrderSummaryRow[]>> tuple style API response: [error, result].
   */
  async getOrderSummaryByDateRange(startDate: Date, endDate: Date): Promise<ApiResult<OrderSummaryRow[]>> {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return [this.createApiError(400, 'Invalid date range provided'), null]
    }

    const [ordersError, orders] = await this.getOrdersByDateRange(startDate, endDate)
    if (ordersError || !orders) {
      return [ordersError || this.createApiError(500, 'Failed to fetch orders'), null]
    }

    return this.buildOrderSummary(orders)
  }
}
