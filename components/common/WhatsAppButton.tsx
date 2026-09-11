import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { buildProductWhatsAppUrl, buildShopWhatsAppUrl } from "@/lib/whatsapp";

interface ProductWhatsAppButtonProps {
  variant: "product";
  productName: string;
  shopName: string;
  whatsappNumber: string;
  productSlug?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

interface ShopWhatsAppButtonProps {
  variant: "shop";
  shopName: string;
  whatsappNumber: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

type WhatsAppButtonProps = ProductWhatsAppButtonProps | ShopWhatsAppButtonProps;

const sizeClasses = {
  sm: "text-xs py-1.5 px-3 gap-1.5",
  md: "text-sm py-2.5 px-5 gap-2",
  lg: "text-base py-3.5 px-7 gap-2.5",
};

const iconSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function WhatsAppButton(props: WhatsAppButtonProps) {
  const { size = "md", fullWidth = false } = props;

  let url: string;
  let label: string;

  if (props.variant === "product") {
    url = buildProductWhatsAppUrl({
      productName: props.productName,
      shopName: props.shopName,
      whatsappNumber: props.whatsappNumber,
      productSlug: props.productSlug,
    });
    label = "Contacter via WhatsApp";
  } else {
    url = buildShopWhatsAppUrl({
      shopName: props.shopName,
      whatsappNumber: props.whatsappNumber,
    });
    label = "Contacter la boutique";
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-whatsapp rounded-xl font-semibold inline-flex items-center justify-center ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`}
      aria-label={`${label} sur WhatsApp`}
    >
      <FaWhatsapp className={iconSizes[size]} aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}
