import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/db';

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { date, description, amount, type, category } = await request.json();

    const { data, error } = await supabase
        .from('transactions')
        .update({ date, description, amount, type, category })
        .eq('id', id)
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

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "deleted" });
}
