import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// GET /api/transactions - Get all transactions
export async function GET() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('id', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
        message: "success",
        data: data
    });
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
    const { date, description, amount, type, category } = await request.json();

    const { data, error } = await supabase
        .from('transactions')
        .insert([{ date, description, amount, type, category }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
        message: "success",
        data: data
    });
}
