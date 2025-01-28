import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface IntegrationData {
    [key: string]: any;
}

class SSLCommerz {
    protected sslcIsSandbox: boolean;
    protected sslcStoreId: string;
    protected sslcStorePass: string;
    private sslcModeName: string;
    protected sslcSessionApi: string;
    protected sslcValidationApi: string;
    protected integrationData: IntegrationData = {};

    constructor(sslcIsSandbox = true, sslcStoreId = "", sslcStorePass = "") {
        this.sslcIsSandbox = sslcIsSandbox;
        this.sslcModeName = this.setSSLCommerzMode(sslcIsSandbox);
        this.sslcStoreId = sslcStoreId;
        this.sslcStorePass = sslcStorePass;

        const sessionApi = process.env.SSLCZ_SESSION_API || "securepay.sslcommerz.com/gwprocess/v4/api.php";
        const validationApi = process.env.SSLCZ_VALIDATION_API || "securepay.sslcommerz.com/validator/api/validationserverAPI.php";

        this.sslcSessionApi = `https://${this.sslcModeName}.${sessionApi}`;
        this.sslcValidationApi = `https://${this.sslcModeName}.${validationApi}`;
    }

    private setSSLCommerzMode(sslcIsSandbox: boolean): string {
        return sslcIsSandbox ? "sandbox" : "securepay";
    }
}

class SSLCSession extends SSLCommerz {
    constructor(sslcIsSandbox = true, sslcStoreId = "", sslcStorePass = "") {
        super(sslcIsSandbox, sslcStoreId, sslcStorePass);
    }

    setUrls(successUrl: string, failUrl: string, cancelUrl: string, ipnUrl = ""): void {
        this.integrationData.success_url = successUrl;
        this.integrationData.fail_url = failUrl;
        this.integrationData.cancel_url = cancelUrl;
        this.integrationData.ipn_url = ipnUrl;
    }

    setProductIntegration(
        totalAmount: number,
        currency: string,
        productCategory: string,
        productName: string,
        numOfItem: number,
        shippingMethod: string,
        productProfile = "None"
    ): void {
        this.integrationData.store_id = this.sslcStoreId;
        this.integrationData.store_passwd = this.sslcStorePass;
        this.integrationData.tran_id = uuidv4();
        this.integrationData.total_amount = totalAmount;
        this.integrationData.currency = currency;
        this.integrationData.product_category = productCategory;
        this.integrationData.product_name = productName;
        this.integrationData.num_of_item = numOfItem;
        this.integrationData.shipping_method = shippingMethod;
        this.integrationData.product_profile = productProfile;
    }

    setCustomerInfo(
        name: string,
        email: string,
        address1: string,
        address2 = "",
        city: string,
        postcode: string,
        country: string,
        phone: string,

    ): void {
        this.integrationData.cus_name = name;
        this.integrationData.cus_email = email;
        this.integrationData.cus_add1 = address1;
        this.integrationData.cus_add2 = address2;
        this.integrationData.cus_city = city;
        this.integrationData.cus_postcode = postcode;
        this.integrationData.cus_country = country;
        this.integrationData.cus_phone = phone;
    }

    setShippingInfo(
        shippingTo: string,
        address: string,
        city: string,
        postcode: string,
        country: string
    ): void {
        this.integrationData.ship_name = shippingTo;
        this.integrationData.ship_add1 = address;
        this.integrationData.ship_city = city;
        this.integrationData.ship_postcode = postcode;
        this.integrationData.ship_country = country;
    }

    setAdditionalValues(valueA = "", valueB = "", valueC = "", valueD = ""): void {
        this.integrationData.value_a = valueA;
        this.integrationData.value_b = valueB;
        this.integrationData.value_c = valueC;
        this.integrationData.value_d = valueD;
    }

    async initPayment(): Promise<any> {
        try {
    
            const encodedData = new URLSearchParams(this.integrationData).toString();

            const response = await axios.post(this.sslcSessionApi, encodedData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

      
            if (response.data.status === "FAILED") {
                return {
                    status: response.data.status,
                    failedReason: response.data.failedreason,
                };
            }
            return {
                status: response.data.status,
                sessionKey: response.data.sessionkey,
                gatewayPageURL: response.data.GatewayPageURL,
            };
        } catch (error: any) {
            return {
                status: "FAILED",
                failedReason: error.message || "Unknown error occurred",
            };
        }
    }
}

class Validation extends SSLCommerz {
    constructor(sslcIsSandbox = true, sslcStoreId = "", sslcStorePass = "") {
        super(sslcIsSandbox, sslcStoreId, sslcStorePass);
    }

    async validateTransaction(validationId: string): Promise<any> {
        const queryParams = {
            val_id: validationId,
            store_id: this.sslcStoreId,
            store_passwd: this.sslcStorePass,
            format: "json",
        };

        try {
            const response = await axios.get(this.sslcValidationApi, { params: queryParams });
            if (response.data.status === "VALIDATED") {
                return {
                    status: "VALIDATED",
                    data: response.data,
                };
            } else {
                return {
                    status: response.data.status,
                    data: response.data,
                };
            }
        } catch (error: any) {
            return {
                status: "FAILED",
                data: `Validation failed: ${error.message}`,
            };
        }
    }
}

export { SSLCSession, Validation };
