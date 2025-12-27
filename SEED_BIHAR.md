# Bihar Shops Seeding Guide

## Overview
This will add 3 shops from each district of Bihar (38 districts = 114 shops total) with different categories.

## Categories Used
- Retail
- Restaurant
- Electronics
- Clothing
- Grocery
- Pharmacy
- Hardware
- Jewelry
- Automobile
- Furniture

## How to Seed

### Option 1: Using Browser/Postman

1. **Make sure server is running:**
   ```bash
   npm run dev
   ```

2. **Open browser and go to:**
   ```
   http://localhost:3000/api/admin/seed-bihar-shops
   ```

3. **Or use curl:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-bihar-shops
   ```

### Option 2: Using Script

```bash
./seed-bihar.sh
```

## Districts Covered (38)

1. Patna
2. Gaya
3. Bhagalpur
4. Muzaffarpur
5. Purnia
6. Darbhanga
7. Bihar Sharif
8. Arrah
9. Begusarai
10. Katihar
11. Munger
12. Chapra
13. Sasaram
14. Hajipur
15. Dehri
16. Bettiah
17. Sitamarhi
18. Motihari
19. Siwan
20. Kishanganj
21. Jamalpur
22. Buxar
23. Jehanabad
24. Aurangabad
25. Lakhisarai
26. Nawada
27. Jamui
28. Sheikhpura
29. Sheohar
30. Araria
31. Madhepura
32. Supaul
33. Vaishali
34. East Champaran
35. West Champaran
36. Saran
37. Gopalganj
38. Samastipur

## Shop Details

Each district gets:
- **3 shops** with different categories
- **Approved status** (visible on homepage)
- **Realistic coordinates** for each district
- **Random ratings** (4-5 stars)
- **Review counts** (10-110 reviews)
- **First shop** of each district is **Featured**

## Verification

After seeding, check:

1. **Homepage:** `http://localhost:3000`
   - Should show shops from Bihar districts

2. **Admin Panel:** `http://localhost:3000/admin/shops`
   - Should show 114 shops

3. **API:** `http://localhost:3000/api/shops?city=Patna`
   - Should return shops from Patna

## Notes

- Shops are automatically **approved** and visible
- Each shop has realistic Bihar addresses
- Coordinates are approximate for each district
- If Basic plan exists, shops will be assigned to it
- Featured shops will show on homepage with priority

## Troubleshooting

### Error: "Plans not found"
Run plan initialization first:
```bash
curl -X POST http://localhost:3000/api/admin/plans/init
```

### Error: "User not found"
The script automatically creates default users if they don't exist.

### Duplicate shops
If you run the script multiple times, it will create duplicate shops. You can delete them from admin panel.

