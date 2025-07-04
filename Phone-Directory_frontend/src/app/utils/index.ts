// 📦 Phone Directory Utilities
// Bu dosya tüm utility sınıflarını merkezi olarak export eder

export { ContactMapper } from './contact.mapper';
export { ApiResponseHandler } from './api-response.handler';
export { ContactFilter } from './contact.filter';
export { FormValidator } from './form.validator';
export type { ValidationResult } from './form.validator';

// 🎯 Utility'lerin kullanım amacı:
// 
// ContactMapper: Backend ↔ Frontend veri dönüşümleri
// ApiResponseHandler: API yanıt işlemleri ve hata yönetimi  
// ContactFilter: Kişi filtreleme ve arama işlemleri
// FormValidator: Form validasyon işlemleri
