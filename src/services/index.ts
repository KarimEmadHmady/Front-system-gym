// Export all services from a single entry point

export { AuthService } from './authService';
export { BaseService } from './baseService';
export { UserService } from './userService';
export { AttendanceService } from './attendanceService';
export { WorkoutService } from './workoutService';
export { DietService } from './dietService';
export { LoyaltyService } from './loyaltyService';
export { PurchaseService } from './purchaseService';
export { MessageService } from './messageService';
export { SessionScheduleService } from './sessionScheduleService';
export { InvoiceService } from './invoiceService';
export { ExpenseService } from './expenseService';
export { RevenueService } from './revenueService';
export { PayrollService } from './payrollService';

// Import classes for instantiation
import { UserService } from './userService';
import { AttendanceService } from './attendanceService';
import { WorkoutService } from './workoutService';
import { DietService } from './dietService';
import { LoyaltyService } from './loyaltyService';
import { PurchaseService } from './purchaseService';
import { MessageService } from './messageService';
import { SessionScheduleService } from './sessionScheduleService';
import { InvoiceService } from './invoiceService';
import { ExpenseService } from './expenseService';
import { RevenueService } from './revenueService';
import { PayrollService } from './payrollService';

// Service instances for easy access
export const userService = new UserService();
export const attendanceService = new AttendanceService();
export const workoutService = new WorkoutService();
export const dietService = new DietService();
export const loyaltyService = new LoyaltyService();
export const purchaseService = new PurchaseService();
export const messageService = new MessageService();
export const sessionScheduleService = new SessionScheduleService();
export const invoiceService = new InvoiceService();
export const expenseService = new ExpenseService();
export const revenueService = new RevenueService();
export const payrollService = new PayrollService();
