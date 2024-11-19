'use client';

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// make amount comma separated
const formatAmount = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Invoice = ({ customerData, products, storeData }) => {
  // Guard clause for missing data
  if (!customerData || !products || !storeData || !customerData.products) {
    console.error("Missing required data:", {
      customerData,
      products,
      storeData,
    });
    return null;
  }

  // Process customer products only if we have all required data
  const customerProducts = customerData.products.map((custProduct) => {
    const productDetails = products.find((p) => p.id === custProduct.productId);
    if (!productDetails) {
      console.warn(`Product not found for id: ${custProduct.productId}`);
      return {
        productName: "Product Not Found",
        size: "-",
        sellingPrice: 0,
        quantity: custProduct.quantity,
      };
    }
    return {
      ...productDetails,
      quantity: custProduct.quantity,
    };
  });

  // Calculate total amount
  const totalAmount = customerProducts.reduce((sum, product) => {
    return sum + Number(product.sellingPrice) * product.quantity;
  }, 0);

  // Function to convert number to words
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    if (num === 0) return "Zero";

    const numStr = num.toString();
    let result = "";

    if (num >= 1000) {
      result += ones[Math.floor(num / 1000)] + " Thousand ";
      num %= 1000;
    }

    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + " ";
      num = 0;
    }

    if (num > 0) {
      result += ones[num] + " ";
    }

    return result.trim() + " Rupees Only";
  };

  // Use useEffect to notify when component is fully rendered
  useEffect(() => {
    window.dispatchEvent(new Event("INVOICE_RENDERED"));
  }, []);

  return (
    <div className="max-w-4xl h-dvh mx-auto bg-white text-black print:m-px">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        {storeData.logo && (
          <img
            src={storeData.logo}
            alt="Store Logo"
            className="h-20"
            onError={(e) => {
              console.warn("Logo failed to load");
              e.target.style.display = "none";
            }}
          />
        )}

        <div className="flex flex-col flex-1 items-center text-center">
          <h1 className="text-3xl font-bold mb-1">{storeData.storeName}</h1>
          <p>{storeData.address}</p>
        </div>
        <div className="flex flex-col text-sm">
          {storeData.mobileNumbers?.map((contact, index) => (
            <p
              key={index}
              className={
                index < storeData.mobileNumbers.length - 1 ? "mb-1" : ""
              }
            >
              <span className="font-semibold">{contact.name}</span> : {contact.number}
            </p>
          ))}
        </div>
      </div>

      {/* Bill Details */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <p className="mb-2">Bill To,</p>
          <h2 className="font-semibold">{customerData.customerName}</h2>
          {customerData.address && <p>{customerData.address}</p>}
          {customerData.mobileNumber && <p>Mo.: {customerData.mobileNumber}</p>}
        </div>
        <div className="text-right">
          <p className="font-semibold">Bill Number</p>
          <p className="mb-2">{customerData.billNumber}</p>
          <p>
            <span className="font-semibold">Date :</span> {formatDate(customerData.createdAt)}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <table className="w-full mb-3 border-collapse">
        <thead>
          <tr>
            <th className="w-16 py-2 bg-muted border border-l-0 text-center">S.No.</th>
            <th className="px-3 py-2 bg-muted border text-left">
              Product Name
            </th>
            <th className="px-3 py-2 bg-muted border text-left">Size</th>
            <th className="w-16 px-3 py-2 bg-muted border text-right">Qty</th>
            <th className="px-3 py-2 bg-muted border text-right">Rate</th>
            <th className="px-3 py-2 bg-muted border border-r-0 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {customerProducts.map((product, index) => (
            <tr key={index}>
              <td className="w-16 py-2 border border-l-0 text-center">{index + 1}</td>
              <td className="px-3 py-2 border">
                <span className="font-semibold">{product.productName}</span>
                <br />
                <small>{product.manufactureCompany}</small>
              </td>
              <td className="px-3 py-2 border">{product.size}</td>
              <td className="w-16 px-3 py-2 border text-right">
                {product.quantity}
              </td>
              <td className="px-3 py-2 border text-right">
                {formatAmount(product.sellingPrice)}
              </td>
              <td className="px-3 py-2 border border-r-0 text-right">
                {formatAmount(Number(product.sellingPrice) * product.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="px-3 py-2 font-semibold border border-l-0 text-right">
              Total Amount
            </td>
            <td className="px-3 py-2 font-semibold border border-r-0 text-right">
              ₹ {formatAmount(totalAmount)}
            </td>
          </tr>
        </tfoot>
      </table>

      <table className="w-full mb-4 border-collapse">
        <tbody>
          <tr>
            <td colSpan="5" className="px-3 py-2 border border-l-0 mt-2">
              <span className="font-semibold">Total Amount (in Word)</span>
              <br />
              {numberToWords(totalAmount)}
            </td>
            <td className="px-3 py-2 border-y text-right mt-2">
              <span className="font-semibold">Payment Type</span>
              <br />
              {customerData.paymentMode.toLowerCase()}
            </td>
          </tr>
          <tr>
            {/* Terms and Conditions */}
            {storeData.terms && (
              <td colSpan="4" className="px-4">
                <h3 className="font-semibold mb-1">Terms and Conditions :</h3>
                <ul className="list-decimal pl-6 text-sm">
                  {storeData.terms.split("\n").map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </td>
            )}
            <td colSpan="2" className="px-6 pt-20 text-right">
              <p className="font-semibold">Authorized Signatory</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const printInvoice = async (customerData) => {
  try {
    toast.loading("Printing Bill...");

    const [productsRes, storeRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/store"),
    ]);

    if (!productsRes.ok || !storeRes.ok) {
      toast.error("Failed to fetch required data");
    }

    const products = await productsRes.json();
    const storeData = await storeRes.json();

    if (!products || !storeData || !customerData) {
      toast.error("Missing required data for invoice");
    }

    const existingPrintDiv = document.getElementById("invoice-print-container");
    if (existingPrintDiv) {
      document.body.removeChild(existingPrintDiv);
    }

    // Create a new div for the print content
    const printDiv = document.createElement("div");
    printDiv.id = "invoice-print-container";
    document.body.appendChild(printDiv);

    // Create a style element for print-specific CSS
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        /* Hide everything except the invoice */
        body > *:not(#invoice-print-container) {
          display: none !important;
        }
        
        /* Show the invoice content */
        #invoice-print-container {
          display: block !important;
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
        }

        /* Page settings */
        @page {
          size: A4;
          border: 1px solid #e7e5e4;
        }

        /* Ensure tables print properly */
        table { page-break-inside: auto; }
        tr { page-break-inside: avoid; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
      }
    `;
    document.head.appendChild(style);

    const renderPromise = new Promise((resolve) => {
      const handleRender = () => {
        window.removeEventListener("INVOICE_RENDERED", handleRender);
        resolve();
      };
      window.addEventListener("INVOICE_RENDERED", handleRender);
    });

    // Render the invoice
    ReactDOM.render(
      <Invoice
        customerData={customerData}
        products={products}
        storeData={storeData}
      />,
      printDiv
    );

    toast.dismiss();
    toast.loading("Bill rendering...");
    await renderPromise;

    toast.dismiss();
    toast.success("Bill rendered successfully");

    // Add a small delay to ensure styles are applied
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Print
    window.print();

    toast.dismiss();
    toast.success("Bill printed successfully");

    document.head.removeChild(style);
    // Don't remove the printDiv immediately to allow for proper printing
    setTimeout(() => {
      if (document.body.contains(printDiv)) {
        document.body.removeChild(printDiv);
      }
    }, 1000);
  } catch (error) {
    toast.error("Failed to print invoice");
    console.error("Error printing invoice:", error);
  }
};

export { printInvoice };
