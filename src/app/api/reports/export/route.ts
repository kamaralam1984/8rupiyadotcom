import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import User from '@/models/User';
import Plan from '@/models/Plan';
import { withAuth, AuthRequest } from '@/middleware/auth';
import { UserRole } from '@/types/user';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
// Import autotable to extend jsPDF
import 'jspdf-autotable';

export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();

    const user = req.user!;
    const { type, format, filters } = await req.json();

    // Only admin and accountant can export
    if (![UserRole.ADMIN, UserRole.ACCOUNTANT].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'shops':
        const shops = await Shop.find(filters || {})
          .populate('planId', 'name price')
          .populate('shopperId', 'name email phone')
          .lean();
        data = shops.map((shop: any) => ({
          Name: shop.name,
          Category: shop.category,
          City: shop.city,
          Status: shop.status,
          Plan: shop.planId?.name || 'N/A',
          'Plan Price': shop.planId?.price || 0,
          Rating: shop.rating,
          'Created At': new Date(shop.createdAt).toLocaleDateString(),
        }));
        filename = 'shops';
        break;

      case 'payments':
        const payments = await Payment.find(filters || {})
          .populate('shopId', 'name')
          .populate('planId', 'name price')
          .lean();
        data = payments.map((payment: any) => ({
          'Shop Name': payment.shopId?.name || 'N/A',
          'Plan Name': payment.planId?.name || 'N/A',
          Amount: payment.amount,
          Status: payment.status,
          'Paid At': payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A',
          'Created At': new Date(payment.createdAt).toLocaleDateString(),
        }));
        filename = 'payments';
        break;

      case 'commissions':
        const commissions = await Commission.find(filters || {})
          .populate('agentId', 'name email')
          .populate('operatorId', 'name email')
          .populate('shopId', 'name')
          .lean();
        data = commissions.map((comm: any) => ({
          'Shop Name': comm.shopId?.name || 'N/A',
          'Agent Name': comm.agentId?.name || 'N/A',
          'Operator Name': comm.operatorId?.name || 'N/A',
          'Agent Amount': comm.agentAmount,
          'Operator Amount': comm.operatorAmount,
          'Company Amount': comm.companyAmount,
          'Total Amount': comm.totalAmount,
          Status: comm.status,
          'Created At': new Date(comm.createdAt).toLocaleDateString(),
        }));
        filename = 'commissions';
        break;

      case 'agents':
        const agents = await User.find({ role: UserRole.AGENT, ...filters })
          .lean();
        data = agents.map((agent: any) => ({
          Name: agent.name,
          Email: agent.email,
          Phone: agent.phone,
          'Is Active': agent.isActive ? 'Yes' : 'No',
          'Created At': new Date(agent.createdAt).toLocaleDateString(),
        }));
        filename = 'agents';
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      // Add headers
      if (data.length > 0) {
        worksheet.columns = Object.keys(data[0]).map((key) => ({
          header: key,
          key,
          width: 20,
        }));

        // Add data
        data.forEach((row) => {
          worksheet.addRow(row);
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.text(`${filename.charAt(0).toUpperCase() + filename.slice(1)} Report`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        if (data.length === 0) {
          doc.setFontSize(12);
          doc.text('No data available', 14, 50);
        } else {
          const tableData = data.map((row) => Object.values(row).map(val => {
            // Convert all values to strings and handle null/undefined
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return String(val);
          }));
          const headers = Object.keys(data[0]);

          // Use autoTable method
          (doc as any).autoTable({
            startY: 40,
            head: [headers],
            body: tableData,
            styles: { 
              fontSize: 8, 
              cellPadding: 3,
              overflow: 'linebreak',
              cellWidth: 'wrap'
            },
            headStyles: { 
              fillColor: [66, 126, 234], 
              textColor: 255, 
              fontStyle: 'bold' 
            },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 40 },
          });
        }

        // Convert to buffer properly - use 'arraybuffer' output
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.pdf"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        });
      } catch (pdfError: any) {
        console.error('PDF generation error:', pdfError);
        console.error('Error stack:', pdfError.stack);
        return NextResponse.json({ 
          error: 'Failed to generate PDF', 
          details: process.env.NODE_ENV === 'development' ? pdfError.message : undefined,
          stack: process.env.NODE_ENV === 'development' ? pdfError.stack : undefined
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, [UserRole.ADMIN, UserRole.ACCOUNTANT]);

