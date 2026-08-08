import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordProps {
  username: string;
  resetUrl: string;
}
export default function ResetPassword({
  username = "{{.Username}}",
  resetUrl = "{{.ResetUrl}}",
}: ResetPasswordProps) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily={["Verdana", "Geneva", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ90OmSqEpJpE.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily={["Verdana", "Geneva", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NShXDFGCl.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>Reset your password for Kaizen account</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Img
            src="https://res.cloudinary.com/jqlbpzen/image/upload/v1784039354/kaizen-logo-noBack_ztttub.png"
            alt="Kaizen"
            width={140}
            style={logoStyle}
          />

          <Container style={cardStyle}>
            <Text style={titleStyle}>Reset your password</Text>
            <Text style={greetingStyle}>Hi {username},</Text>
            <Text style={bodyTextStyle}>
              We received a request to reset the password for your Kaizen account.
            </Text>
            <Text style={bodyTextStyle}>
              Click the button below to reset your password. This link will
              expire in 30 minutes.
            </Text>

            <Button href={resetUrl} style={buttonStyle}>
              Reset Password
            </Button>

            <Text style={expirationStyle}>
              This password reset link expires in 30 minutes.
            </Text>

            <Text style={securityStyle}>
              If you didn't request this password reset, please ignore this
              email or contact support.
            </Text>
          </Container>

          <Container style={footerStyle}>
            <Text style={footerTextStyle}>
              © 2026 Kaizen.
            </Text>
            <Text style={footerTextStyle}>
              Helping you improve one day at a time.
            </Text>
            <Text style={footerLinkStyle}>
              Need help?{" "}
              <Link href="mailto:support@kaizen-app.com" style={linkStyle}>
                Contact our support team.
              </Link>
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: "0",
  padding: "0",
  backgroundColor: "#ffffff",
  fontFamily: "'Inter', Verdana, Geneva, sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const containerStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: "48px 24px",
  maxWidth: "520px",
};

const logoStyle: React.CSSProperties = {
  display: "block",
  margin: "0 auto 40px",
  position: "relative",
  left: "-10px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "40px 36px",
  textAlign: "center",
  border: "1px solid #e8eae9",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 28px",
  fontFamily: "'Plus Jakarta Sans', Verdana, Geneva, sans-serif",
  fontSize: "26px",
  fontWeight: 700,
  lineHeight: "1.3",
  color: "#2d3b36",
};

const greetingStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "1.5",
  color: "#2d3b36",
  textAlign: "left",
};

const bodyTextStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "15px",
  fontWeight: 400,
  lineHeight: "1.65",
  color: "#6b6b6b",
  textAlign: "left",
};

const buttonStyle = {
  display: "inline-block",
  margin: "28px 0",
  padding: "14px 40px",
  backgroundColor: "#4caf7d",
  color: "#ffffff",
  fontFamily: "'Inter', Verdana, Geneva, sans-serif",
  fontSize: "15px",
  fontWeight: 600,
  lineHeight: "1",
  textDecoration: "none",
  borderRadius: "10px",
  textAlign: "center",
  cursor: "pointer",
} as const;

const expirationStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: "1.6",
  color: "#9ea7a3",
  textAlign: "center",
};

const securityStyle: React.CSSProperties = {
  margin: "20px 0 0",
  padding: "16px",
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: "1.6",
  color: "#9ea7a3",
  textAlign: "center",
  backgroundColor: "#f5f5f5",
  borderRadius: "8px",
};

const footerStyle: React.CSSProperties = {
  marginTop: "32px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: "1.6",
  color: "#9ea7a3",
};

const footerLinkStyle: React.CSSProperties = {
  margin: "12px 0 0",
  fontSize: "13px",
  fontWeight: 400,
  lineHeight: "1.6",
  color: "#9ea7a3",
};

const linkStyle: React.CSSProperties = {
  color: "#4caf7d",
  textDecoration: "underline",
};
