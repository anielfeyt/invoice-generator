"use client";

import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Register font
Font.register({
  family: "Geist",
  fonts: [
    { src: "/fonts/Geist-Regular.ttf" },
    { src: "/fonts/Geist-Medium.ttf", fontWeight: "medium" },
    { src: "/fonts/Geist-SemiBold.ttf", fontWeight: "semibold" },
    { src: "/fonts/Geist-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: "24px",
    fontSize: "12px",
    fontFamily: "Geist",
  },
  section: {
    marginBottom: "24px",
    paddingBottom: "8px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "semibold",
    marginBottom: "8px",
  },
  subHeading: {
    fontSize: "16px",
    fontWeight: "medium",
    marginBottom: "8px",
  },
  amountDue: {
    fontSize: "20px",
    fontWeight: "bold",
  },
});

export default function PdfDocument({ details, items, calculateTotal }) {
  const { date, invoiceNumber, billTo, address, notes } = details;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            // backgroundColor: "blue",
            marginBottom: "24px",
          }}
        >
          <Image
            src="/next.png"
            style={{
              height: "auto",
              width: "100%",
              maxWidth: "300px", // same as width of right section
              maxHeight: "30px",
              objectFit: "contain",
              objectPosition: "left",
            }}
          />
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <View>
            <Text style={styles.heading}>INVOICE</Text>
            <Text style={{ color: "#777777" }}>
              #{invoiceNumber || "INV-001"}
            </Text>
            <Text style={{ color: "#777777" }}>
              Due Date:{" "}
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.subHeading}>Total Due</Text>
            <Text style={styles.amountDue}>R{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subHeading}>Bill To</Text>
          <View style={{ marginBottom: "12px", gap: "4px" }}>
            <Text>Client Name</Text>
            <Text style={{ color: "#777777" }}>{billTo}</Text>
          </View>
          <View style={{ gap: "4px" }}>
            <Text>Billing Address</Text>
            <Text style={{ color: "#777777" }}>{address}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <View
            style={{
              flexDirection: "row",
              gap: "8px",
              marginBottom: "8px",
              borderBottom: "1px solid #d6d6d6",
              paddingBottom: "8px",
            }}
          >
            <Text style={{ width: "100%", fontWeight: "semibold" }}>
              Description
            </Text>
            <Text
              style={{
                width: "60px",
                textAlign: "right",
                fontWeight: "semibold",
              }}
            >
              Qty
            </Text>
            <Text
              style={{
                width: "150px",
                textAlign: "right",
                fontWeight: "semibold",
              }}
            >
              Price
            </Text>
            <Text
              style={{
                width: "150px",
                textAlign: "right",
                fontWeight: "semibold",
              }}
            >
              Total
            </Text>
          </View>
          {items.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                gap: "8px",
                marginBottom: "4px",
                borderBottom: "1px solid #d6d6d6",
                paddingBottom: "8px",
              }}
            >
              <Text style={{ width: "100%" }}>
                {item.description || "Item description"}
              </Text>
              <Text
                style={{
                  width: "60px",
                  textAlign: "right",
                }}
              >
                {item.quantity}
              </Text>
              <Text style={{ width: "150px", textAlign: "right" }}>
                R{item.price.toFixed(2)}
              </Text>
              <Text style={{ width: "150px", textAlign: "right" }}>
                R{(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
        <View style={[styles.section, { borderBottom: "1px solid #d6d6d6" }]}>
          {/* <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={styles.subHeading}>Subtotal</Text>
              <Text>${calculateSubtotal().toFixed(2)}</Text>
            </View> */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text style={styles.subHeading}>Total</Text>

            <Text style={{ fontFamily: "Geist", fontWeight: "semibold" }}>
              R{calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.subHeading}>Additional Notes</Text>
          <Text>{notes}</Text>
        </View>
      </Page>
    </Document>
  );
}
