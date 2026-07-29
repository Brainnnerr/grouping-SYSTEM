import { supabase } from './supabaseClient';
import { TRIBUS } from '../utils/tribuData';

// Helper to normalize student numbers (e.g. "23-01786" and "23-001786" both become equivalent)
const normalizeStudentNumber = (num) => {
  if (!num) return '';
  const parts = num.split('-');
  if (parts.length > 1) {
    const prefix = parts[0];
    const serial = parseInt(parts[1], 10);
    return `${prefix}-${serial}`;
  }
  return num.replace(/[^0-9]/g, '');
};

export const registerStudent = async (studentData) => {
  const normalizedInputId = normalizeStudentNumber(studentData.student_number);

  // 1. Fetch all existing students to check normalized student numbers securely
  const { data: existingStudents, error: fetchError } = await supabase
    .from('students')
    .select('student_number');

  if (fetchError) throw new Error(fetchError.message);

  const isDuplicate = existingStudents?.some(
    (s) => normalizeStudentNumber(s.student_number) === normalizedInputId
  );

  if (isDuplicate) {
    throw new Error('This student number is already registered!');
  }

  // 2. Get total count to distribute evenly using round-robin modulo logic
  // Exclude 'Tribu Agos' from active auto-assignments so it no longer accepts new registrations
  const ACTIVE_TRIBUS = TRIBUS.filter(tribu => tribu !== 'Tribu Agos');

  const { count, error: countError } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(countError.message);

  const nextIndex = (count || 0) % ACTIVE_TRIBUS.length;
  const assignedTribu = ACTIVE_TRIBUS[nextIndex];

  // 3. Insert new student into Supabase
  const { data, error: insertError } = await supabase
    .from('students')
    .insert([
      {
        student_number: studentData.student_number,
        full_name: studentData.full_name,
        program: studentData.program,
        year_level: studentData.year_level,
        section: studentData.section,
        tribu_name: assignedTribu
      }
    ])
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);
  return data;
};

export const findStudentByNumber = async (studentNumber) => {
  const normalizedInputId = normalizeStudentNumber(studentNumber);
  const { data: existingStudents, error: fetchError } = await supabase
    .from('students')
    .select('*');

  if (fetchError) throw new Error(fetchError.message);

  const found = existingStudents?.find(
    (s) => normalizeStudentNumber(s.student_number) === normalizedInputId
  );

  return found || null;
};

export const fetchTribuMembers = async (tribuName) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('tribu_name', tribuName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tribu members:', error);
    return [];
  }
  return data;
};

export const fetchAllStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all students:', error);
    return [];
  }
  return data;
};

export const fetchTribuMessages = async (tribuName) => {
  const { data, error } = await supabase
    .from('tribu_chats')
    .select('*')
    .eq('tribu_name', tribuName)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
  return data;
};

// Send a chat message as a Tribu member
export const sendTribuMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('tribu_chats')
    .insert([
      {
        tribu_name: messageData.tribu_name,
        student_number: messageData.student_number,
        full_name: messageData.full_name,
        message: messageData.message
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update existing student details from Admin panel
export const updateStudent = async (studentId, updatedData) => {
  const { data, error } = await supabase
    .from('students')
    .update({
      full_name: updatedData.full_name,
      student_number: updatedData.student_number,
      program: updatedData.program,
      year_level: updatedData.year_level,
      section: updatedData.section,
      tribu_name: updatedData.tribu_name
    })
    .eq('id', studentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Delete student record from Supabase
export const deleteStudent = async (studentId) => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', studentId);

  if (error) throw new Error(error.message);
  return true;
};
         
