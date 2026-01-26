# 🗄️ AIRTABLE SETUP GUIDE
## GASP Affiliate Campaign Database

**Status**: READY TO SETUP  
**Time Required**: 30 minutes  
**Credentials Needed**: None (free Airtable account)

---

## 🚀 **IMMEDIATE SETUP (No Credentials Needed)**

### **Step 1: Create Airtable Account**
```
1. Go to airtable.com
2. Click "Sign Up" (free)
3. Use your email or Google account
4. Verify email address
```

### **Step 2: Create New Base**
```
1. Click "Add a base"
2. Choose "Start from scratch"
3. Name it: "GASP Affiliate Campaign"
4. Click "Create base"
```

### **Step 3: Create Tables**
You'll need to create 5 tables manually. Here's how:

---

## 📊 **TABLE 1: AFFILIATES**

### **Create Table**
```
1. Click "Add a table"
2. Name it: "Affiliates"
3. Click "Create table"
```

### **Add Fields**
```
1. Click "+ Add field" for each field below
2. Set field type and name exactly as shown
```

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Affiliate ID | Single line text | |
| Name | Single line text | |
| Email | Email | |
| Phone | Phone number | |
| Commission Type | Single select | Options: CPL, Revenue Share, Both |
| CPL Rate | Number | |
| Revenue Share % | Number | |
| Status | Single select | Options: Active, Paused, Suspended |
| Join Date | Date | |
| Total Leads | Number | |
| Total Sales | Number | |
| Total Revenue | Currency | |
| Total Commissions | Currency | |
| Last Activity | Date | |
| Notes | Long text | |

---

## 📊 **TABLE 2: LEADS**

### **Create Table**
```
1. Click "Add a table"
2. Name it: "Leads"
3. Click "Create table"
```

### **Add Fields**
| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Email | Email | |
| First Name | Single line text | |
| Last Name | Single line text | |
| Affiliate ID | Single line text | |
| UTM Source | Single line text | |
| UTM Medium | Single line text | |
| UTM Campaign | Single line text | |
| Product Type | Single select | Options: Masterclass, Course |
| Amount | Currency | |
| Registration Date | Date | |
| Status | Single select | Options: Registered, Attended, Purchased |
| Masterclass Date | Date | |
| Attended | Checkbox | |
| Course Purchased | Checkbox | |
| Purchase Date | Date | |
| Commission Earned | Currency | |
| Notes | Long text | |

---

## 📊 **TABLE 3: COMMISSIONS**

### **Create Table**
```
1. Click "Add a table"
2. Name it: "Commissions"
3. Click "Create table"
```

### **Add Fields**
| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Affiliate ID | Single line text | |
| Lead Email | Email | |
| Commission Type | Single select | Options: CPL, Revenue Share |
| Base Amount | Currency | |
| Bonus Amount | Currency | |
| Total Commission | Currency | |
| Status | Single select | Options: Pending, Approved, Paid |
| Payout Period | Single select | Options: Week 1, Week 2, etc. |
| Payout Date | Date | |
| Notes | Long text | |

---

## 📊 **TABLE 4: PAYOUTS**

### **Create Table**
```
1. Click "Add a table"
2. Name it: "Payouts"
3. Click "Create table"
```

### **Add Fields**
| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Payout Period | Single line text | |
| Start Date | Date | |
| End Date | Date | |
| Total Commissions | Currency | |
| Affiliate Count | Number | |
| Status | Single select | Options: Pending, Processing, Paid |
| Routable Batch ID | Single line text | |
| Payment Date | Date | |
| Notes | Long text | |

---

## 📊 **TABLE 5: CAMPAIGN SETTINGS**

### **Create Table**
```
1. Click "Add a table"
2. Name it: "Campaign Settings"
3. Click "Create table"
```

### **Add Fields**
| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Setting Name | Single line text | |
| Value | Single line text | |
| Description | Long text | |
| Last Updated | Date | |
| Updated By | Single line text | |

---

## 🎯 **CREATE VIEWS**

### **Affiliates Views**
```
1. Click "Add a view"
2. Name: "All Affiliates"
3. Click "Add a view"
4. Name: "Active Affiliates"
5. Filter: Status = Active
6. Click "Add a view"
7. Name: "Top Performers"
8. Sort: Total Commissions (Descending)
```

### **Leads Views**
```
1. Click "Add a view"
2. Name: "All Leads"
3. Click "Add a view"
4. Name: "This Week"
5. Filter: Registration Date = This week
6. Click "Add a view"
7. Name: "By Affiliate"
8. Group by: Affiliate ID
```

### **Commissions Views**
```
1. Click "Add a view"
2. Name: "All Commissions"
3. Click "Add a view"
4. Name: "Pending"
5. Filter: Status = Pending
6. Click "Add a view"
7. Name: "This Period"
8. Filter: Payout Period = Current
```

---

## 🔗 **SET UP RELATIONSHIPS**

### **Link Affiliates to Leads**
```
1. In Leads table, click on Affiliate ID field
2. Click "Link to another record"
3. Choose "Affiliates" table
4. Select "Affiliate ID" field
5. Click "Save"
```

### **Link Leads to Commissions**
```
1. In Commissions table, click on Lead Email field
2. Click "Link to another record"
3. Choose "Leads" table
4. Select "Email" field
5. Click "Save"
```

---

## 📝 **ADD SAMPLE DATA**

### **Campaign Settings**
```
Add these initial settings:
- Setting Name: CPL_Rate
- Value: 3
- Description: Base CPL commission per registration

- Setting Name: Revenue_Share_Rate
- Value: 10
- Description: Revenue share percentage for course sales

- Setting Name: Payout_Schedule
- Value: Weekly
- Description: How often affiliates get paid

- Setting Name: Minimum_Payout
- Value: 50
- Description: Minimum amount for payout
```

### **Test Affiliate**
```
Add a test affiliate:
- Affiliate ID: TEST001
- Name: Test Affiliate
- Email: test@example.com
- Commission Type: CPL
- CPL Rate: 3
- Status: Active
- Join Date: Today
```

---

## 🔧 **CONFIGURE AUTOMATIONS**

### **Set Up Field Updates**
```
1. Click "Automations" in top right
2. Click "Create automation"
3. Choose "When a record matches conditions"
4. Set up: When Lead Status = "Purchased"
5. Action: Update Affiliate record
6. Increment Total Sales by 1
```

---

## 📱 **MOBILE APP SETUP**

### **Download Airtable App**
```
1. Download from App Store/Google Play
2. Sign in with same account
3. Sync your base
4. Access on mobile for monitoring
```

---

## 🎯 **NEXT STEPS AFTER SETUP**

### **Immediate (After Setup)**
1. **Test the structure** with sample data
2. **Verify all views** work correctly
3. **Test relationships** between tables
4. **Set up mobile access**

### **When Credentials Arrive**
1. **Get Airtable API key** (Account → API)
2. **Get Base ID** (from URL)
3. **Configure Make workflows** with these credentials
4. **Test data flow** from ThriveCart

---

## ⚠️ **COMMON SETUP ISSUES**

### **Field Type Problems**
```
- If field type is wrong, delete and recreate
- Single select fields need options added
- Currency fields should be set to USD
- Date fields should include time if needed
```

### **Relationship Issues**
```
- Make sure field names match exactly
- Check that linked fields are the same type
- Verify table names are correct
- Test with sample data first
```

---

## 🎉 **SETUP COMPLETE CHECKLIST**

- [ ] Airtable account created
- [ ] Base "GASP Affiliate Campaign" created
- [ ] All 5 tables created with correct fields
- [ ] All views created and configured
- [ ] Relationships set up between tables
- [ ] Sample data added
- [ ] Mobile app configured
- [ ] Structure tested with sample data

---

**🚀 COMPLETE THIS SETUP NOW AND YOU'LL BE READY TO INTEGRATE WITH MAKE AS SOON AS YOUR CREDENTIALS ARRIVE!**

**This gives you a professional database structure that will handle your entire affiliate campaign!**




