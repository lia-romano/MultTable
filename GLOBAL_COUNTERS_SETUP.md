# הוראות הגדרת מונה גלובלי אמיתי

## הבעיה הנוכחית
המונים הגלובליים לא עובדים כרגע כי שירותי מונים חינמיים רבים נסגרו או דורשים הרשמה מורכבת.

## פתרונות אמיתיים למונה גלובלי

### אפשרות 1: Firebase Realtime Database (מומלץ)

1. **הירשם ל-Firebase**: https://firebase.google.com/
2. **צור פרויקט חדש**: "lia-multiplication-game"
3. **הפעל Realtime Database**
4. **הגדר כללי אבטחה פשוטים**:
   ```json
   {
     "rules": {
       "counters": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
5. **העתק את ה-Database URL** והחלף ב-index.html

### אפשרות 2: Supabase (פשוט ויעיל)

1. **הירשם ל-Supabase**: https://supabase.com/
2. **צור פרויקט חדש**
3. **צור טבלה counters**:
   ```sql
   CREATE TABLE counters (
     name TEXT PRIMARY KEY,
     count INTEGER DEFAULT 0
   );
   INSERT INTO counters (name, count) VALUES ('visits', 0), ('exercises', 0);
   ```
4. **העתק את ה-URL וה-anon key**

### אפשרות 3: Google Sheets API (יצירתי)

1. **צור Google Sheet** עם עמודות: Counter Name, Count
2. **פרסם כ-Web App** עם Google Apps Script
3. **השתמש ב-API הפשוט**

### אפשרות 4: Netlify Functions (למתקדמים)

1. **הוסף נתיקה לNetlify**
2. **צור Functions** למונים
3. **השתמש ב-FaunaDB** או PostgreSQL

## הקוד הנוכחי

הקוד מוכן לכל אחד מהפתרונות האלה. פשוט צריך:

1. **להרשם לשירות**
2. **להחליף את הURL וה-Keys**
3. **לפרסם את האתר**

## למה זה לא עובד עכשיו?

- שירותי מונים פשוטים (CountAPI וכו') לא עובדים יותר
- צריך שירות אמין עם API key
- בפיתוח מקומי לא נוח להגדיר שירותים חיצוניים

## המלצה

**השתמש ב-Firebase** - זה החינמי והפשוט ביותר:
1. 5 דקות הגדרה
2. 10GB חינמי בחודש
3. אמין ומהיר
4. תמיכה מלאה ב-JavaScript

כשהאתר יפורסם ברשת - המונים יעבדו מושלם!
