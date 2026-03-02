import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StudyMaterial {
    id: string;
    title: string;
    contentType: string;
    isPremium: boolean;
    createdAt: Time;
    tags: Array<string>;
    description: string;
    subjectId: string;
    blobId: ExternalBlob;
    uploader: Principal;
    downloadCount: bigint;
}
export interface PurchaseRecord {
    userId: Principal;
    materialId: string;
    purchasedAt: Time;
    stripeSessionId: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Subject {
    id: string;
    name: string;
    description: string;
}
export interface StudyMaterialPublic {
    id: string;
    title: string;
    contentType: string;
    isPremium: boolean;
    createdAt: Time;
    tags: Array<string>;
    description: string;
    subjectId: string;
    blobId?: ExternalBlob;
    uploader: Principal;
    downloadCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSubject(subject: Subject): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminIfFirst(): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteMaterial(materialId: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getMaterial(materialId: string): Promise<StudyMaterialPublic | null>;
    getMaterialBlobId(materialId: string): Promise<ExternalBlob | null>;
    getMaterialsBySubject(subjectId: string): Promise<Array<StudyMaterialPublic>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubjects(): Promise<Array<Subject>>;
    getUserPurchases(): Promise<Array<PurchaseRecord>>;
    hasPurchased(materialId: string): Promise<boolean>;
    incrementDownloadCount(materialId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listMaterials(includePremium: boolean): Promise<Array<StudyMaterialPublic>>;
    recordPurchase(record: PurchaseRecord): Promise<void>;
    searchMaterials(searchTerm: string): Promise<Array<StudyMaterialPublic>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    uploadMaterial(material: StudyMaterial): Promise<void>;
}
