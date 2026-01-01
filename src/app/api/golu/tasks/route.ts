import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UnprioritizedTask, { TaskStatus, TaskCategory } from '@/models/UnprioritizedTask';
import { withAuth, AuthRequest } from '@/middleware/auth';

// GET /api/golu/tasks - Get all tasks for authenticated user
export const GET = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId } = req.user;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    
    // Build query
    const query: any = {
      userId,
      isDeleted: false,
    };
    
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      query.status = status;
    }
    
    if (category && Object.values(TaskCategory).includes(category as TaskCategory)) {
      query.category = category;
    }
    
    const tasks = await UnprioritizedTask.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Get statistics
    const stats = await UnprioritizedTask.getTaskStats(userId);
    
    return NextResponse.json({
      success: true,
      tasks,
      stats,
      count: tasks.length,
    });
    
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// POST /api/golu/tasks - Create a new task
export const POST = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId, name } = req.user;
    const body = await req.json();
    
    const {
      title,
      description,
      category = TaskCategory.OTHER,
      links,
      notes,
      tags,
      estimatedTime,
    } = body;
    
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }
    
    const task = await UnprioritizedTask.create({
      userId,
      userName: name,
      title: title.trim(),
      description: description?.trim(),
      category,
      status: TaskStatus.PENDING,
      links: links || [],
      notes: notes?.trim(),
      tags: tags || [],
      estimatedTime,
    });
    
    console.log(`✅ Task created: "${title}" by ${name}`);
    
    return NextResponse.json({
      success: true,
      task,
      message: 'Task created successfully',
    });
    
  } catch (error: any) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// PATCH /api/golu/tasks - Update a task
export const PATCH = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId } = req.user;
    const body = await req.json();
    
    const {
      taskId,
      title,
      description,
      category,
      status,
      links,
      notes,
      tags,
      estimatedTime,
    } = body;
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const task = await UnprioritizedTask.findOne({
      _id: taskId,
      userId,
      isDeleted: false,
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim();
    if (category !== undefined) task.category = category;
    if (status !== undefined) task.status = status;
    if (links !== undefined) task.links = links;
    if (notes !== undefined) task.notes = notes?.trim();
    if (tags !== undefined) task.tags = tags;
    if (estimatedTime !== undefined) task.estimatedTime = estimatedTime;
    
    await task.save();
    
    console.log(`✅ Task updated: ${taskId}`);
    
    return NextResponse.json({
      success: true,
      task,
      message: 'Task updated successfully',
    });
    
  } catch (error: any) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE /api/golu/tasks - Delete (soft delete) a task
export const DELETE = withAuth(async (req: AuthRequest) => {
  try {
    await connectDB();
    
    const { userId } = req.user;
    const url = new URL(req.url);
    const taskId = url.searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    const task = await UnprioritizedTask.findOne({
      _id: taskId,
      userId,
      isDeleted: false,
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    task.isDeleted = true;
    await task.save();
    
    console.log(`🗑️  Task deleted: ${taskId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
    
  } catch (error: any) {
    console.error('Failed to delete task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

