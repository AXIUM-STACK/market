/**
 * AXIUMarket — WhatsApp Commerce Utility
 *
 * Generates WhatsApp URLs for product and shop contact.
 * The WhatsApp CTA is the primary commerce action in V1.
 */

/**
 * Normalizes a phone number for WhatsApp API use.
 * Strips non-numeric chars and ensures a leading country code.
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters except leading +
  const stripped = phone.replace(/[^\d+]/g, "");

  // If starts with +, remove it (WhatsApp uses plain numbers without +)
  const withoutPlus = stripped.startsWith("+") ? stripped.slice(1) : stripped;

  // If starts with 00, remove leading 00
  const withoutLeadingZeros = withoutPlus.startsWith("00")
    ? withoutPlus.slice(2)
    : withoutPlus;

  return withoutLeadingZeros;
}

/**
 * Encodes a message for safe use in a WhatsApp URL.
 */
function encodeWhatsAppMessage(message: string): string {
  return encodeURIComponent(message.trim());
}

/**
 * Builds a WhatsApp wa.me URL with a pre-filled message.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedMessage = encodeWhatsAppMessage(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export interface ProductWhatsAppOptions {
  productName: string;
  shopName: string;
  whatsappNumber: string;
  productSlug?: string;
}

/**
 * Generates a WhatsApp URL for a specific product inquiry.
 * Creates a contextual French message for the merchant.
 */
export function buildProductWhatsAppUrl({
  productName,
  shopName,
  whatsappNumber,
  productSlug,
}: ProductWhatsAppOptions): string {
  const productRef = productSlug
    ? `${productName} (réf: ${productSlug})`
    : productName;

  const message =
    `Bonjour ! Je suis intéressé(e) par votre produit *${productRef}* ` +
    `disponible sur AXIUMarket depuis votre boutique *${shopName}*. ` +
    `Est-il toujours disponible ? Quels sont les détails (prix, livraison) ?`;

  return buildWhatsAppUrl(whatsappNumber, message);
}

export interface ShopWhatsAppOptions {
  shopName: string;
  whatsappNumber: string;
}

/**
 * Generates a WhatsApp URL for general shop contact.
 */
export function buildShopWhatsAppUrl({
  shopName,
  whatsappNumber,
}: ShopWhatsAppOptions): string {
  const message =
    `Bonjour ! J'ai découvert votre boutique *${shopName}* sur AXIUMarket. ` +
    `Je souhaite en savoir plus sur vos produits et services.`;

  return buildWhatsAppUrl(whatsappNumber, message);
}
