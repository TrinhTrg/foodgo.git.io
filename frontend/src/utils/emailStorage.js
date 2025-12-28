/**
 * Utility để quản lý lịch sử email đã sử dụng trong localStorage
 */

const STORAGE_KEY = 'foodgo_email_history';
const MAX_EMAILS = 10; // Giới hạn số lượng email lưu trữ

/**
 * Lấy danh sách email đã lưu
 * @returns {string[]} Mảng các email đã lưu
 */
export const getStoredEmails = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const emails = JSON.parse(stored);
    return Array.isArray(emails) ? emails : [];
  } catch (error) {
    console.error('Error reading email history:', error);
    return [];
  }
};

/**
 * Lưu email vào lịch sử
 * @param {string} email - Email cần lưu
 */
export const saveEmail = (email) => {
  if (!email || typeof email !== 'string') return;
  
  try {
    const emailLower = email.toLowerCase().trim();
    if (!emailLower) return;
    
    let emails = getStoredEmails();
    
    // Xóa email cũ nếu đã tồn tại (để đưa lên đầu)
    emails = emails.filter(e => e.toLowerCase() !== emailLower);
    
    // Thêm email mới vào đầu mảng
    emails.unshift(emailLower);
    
    // Giới hạn số lượng
    emails = emails.slice(0, MAX_EMAILS);
    
    // Lưu vào localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error('Error saving email:', error);
  }
};

/**
 * Xóa tất cả lịch sử email
 */
export const clearEmailHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing email history:', error);
  }
};

/**
 * Lọc email theo từ khóa
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {string[]} Mảng email khớp
 */
export const filterEmails = (query) => {
  if (!query || typeof query !== 'string') return getStoredEmails();
  
  const queryLower = query.toLowerCase().trim();
  const emails = getStoredEmails();
  
  return emails.filter(email => 
    email.toLowerCase().includes(queryLower)
  );
};

