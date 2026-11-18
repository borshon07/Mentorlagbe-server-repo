import "dotenv/config";
import { auth } from "../config/auth.js";
import { connectDB, getClient } from "../config/db.js";

const img = (seed) => `https://picsum.photos/seed/${seed}/800/500`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const DEMO_PASSWORD = "Demo@12345";

const tutors = [
  { name: "Tanvir Ahmed", email: "tanvir@mentorlagbe.com", phone: "+8801712345001", university: "University of Dhaka", qualification: "BSc in Physics", experience: 5, subjects: ["Physics", "Math"], location: "Dhanmondi, Dhaka", bio: "Experienced Physics tutor specializing in HSC and admission preparation." },
  { name: "Sadia Rahman", email: "sadia@mentorlagbe.com", phone: "+8801712345002", university: "BRAC University", qualification: "BBA", experience: 4, subjects: ["English", "IELTS"], location: "Uttara, Dhaka", bio: "IELTS instructor helping students improve their English communication skills." },
  { name: "Imran Hossain", email: "imran@mentorlagbe.com", phone: "+8801712345003", university: "BUET", qualification: "BSc in CSE", experience: 3, subjects: ["Programming", "ICT", "Math"], location: "Mirpur, Dhaka", bio: "Computer Science graduate teaching programming and ICT." },
  { name: "Mehnaz Chowdhury", email: "mehnaz@mentorlagbe.com", phone: "+8801712345004", university: "Chittagong University", qualification: "MSc in Biology", experience: 6, subjects: ["Biology", "Chemistry"], location: "Agrabad, Chittagong", bio: "Biology specialist with experience in medical admission preparation." },
  { name: "Arif Mahmud", email: "arif@mentorlagbe.com", phone: "+8801712345005", university: "Rajshahi University", qualification: "MSc in Mathematics", experience: 7, subjects: ["Math"], location: "Rajshahi", bio: "Mathematics teacher focused on concept-based learning." },
  { name: "Nusrat Jahan", email: "nusrat.tutor@mentorlagbe.com", phone: "+8801712345006", university: "North South University", qualification: "BSc in English", experience: 3, subjects: ["English"], location: "Bashundhara, Dhaka", bio: "Friendly language tutor for school and college students." },
  { name: "Rakib Hasan", email: "rakib.tutor@mentorlagbe.com", phone: "+8801712345007", university: "Hajee Mohammad Danesh Science and Technology University", qualification: "BSc in Computer Science", experience: 2, subjects: ["ICT", "Programming", "Math"], location: "Dinajpur", bio: "Technology enthusiast teaching ICT and beginner programming." },
  { name: "Farzana Akter", email: "farzana@mentorlagbe.com", phone: "+8801712345008", university: "National University", qualification: "MSc in Chemistry", experience: 5, subjects: ["Chemistry", "Science"], location: "Rangpur", bio: "Dedicated science educator with a focus on practical understanding." },
];

const students = [
  { name: "Ayesha Rahman", email: "ayesha@mentorlagbe.com", phone: "+8801812345001", classLevel: "HSC", institution: "Dhaka City College", location: "Dhanmondi, Dhaka", preferredSubjects: ["Physics", "Chemistry", "Math"] },
  { name: "Sakib Ahmed", email: "sakib@mentorlagbe.com", phone: "+8801812345002", classLevel: "SSC", institution: "Motijheel Government Boys' High School", location: "Motijheel, Dhaka", preferredSubjects: ["Math", "English"] },
  { name: "Mim Akter", email: "mim@mentorlagbe.com", phone: "+8801812345003", classLevel: "University", institution: "University of Dhaka", location: "Nilkhet, Dhaka", preferredSubjects: ["Programming", "English"] },
  { name: "Rafi Islam", email: "rafi@mentorlagbe.com", phone: "+8801812345004", classLevel: "HSC", institution: "Rajshahi College", location: "Rajshahi", preferredSubjects: ["Biology", "Chemistry"] },
  { name: "Sumaiya Khan", email: "sumaiya@mentorlagbe.com", phone: "+8801812345005", classLevel: "O Level", institution: "Scholastica", location: "Uttara, Dhaka", preferredSubjects: ["Physics", "Math"] },
  { name: "Nayeem Hasan", email: "nayeem@mentorlagbe.com", phone: "+8801812345006", classLevel: "SSC", institution: "Dinajpur Zilla School", location: "Dinajpur", preferredSubjects: ["Math", "Science"] },
  { name: "Tanjila Akter", email: "tanjila@mentorlagbe.com", phone: "+8801812345007", classLevel: "HSC", institution: "Carmichael College", location: "Rangpur", preferredSubjects: ["English", "Biology"] },
  { name: "Mahin Chowdhury", email: "mahin@mentorlagbe.com", phone: "+8801812345008", classLevel: "University", institution: "BRAC University", location: "Bashundhara, Dhaka", preferredSubjects: ["Programming", "Math"] },
];

// monthlyFee USD te (UI te $ dekhay)
const tuitionTemplates = [
  { title: "HSC Physics Complete Preparation", subject: "Physics", classLevel: "HSC", mode: "Online", location: "Zoom", monthlyFee: 35, daysPerWeek: 3, description: "Complete HSC Physics preparation with chapter-wise lessons, practice exams and doubt-solving sessions." },
  { title: "SSC Higher Mathematics", subject: "Math", classLevel: "SSC", mode: "Offline", location: "Dhanmondi, Dhaka", monthlyFee: 45, daysPerWeek: 4, description: "Concept-based mathematics classes covering algebra, geometry and trigonometry." },
  { title: "IELTS Academic Preparation", subject: "IELTS", classLevel: "University", mode: "Online", location: "Google Meet", monthlyFee: 50, daysPerWeek: 4, description: "Complete IELTS preparation with mock tests and feedback on speaking and writing." },
  { title: "Python Programming for Beginners", subject: "Programming", classLevel: "University", mode: "Online", location: "Zoom", monthlyFee: 40, daysPerWeek: 3, description: "Learn Python fundamentals, problem solving and practical programming projects." },
  { title: "HSC Biology and Medical Preparation", subject: "Biology", classLevel: "HSC", mode: "Online", location: "Zoom", monthlyFee: 38, daysPerWeek: 4, description: "Biology lessons with chapter-wise MCQs and medical admission preparation." },
  { title: "English Grammar and Spoken English", subject: "English", classLevel: "Class 6-8", mode: "Offline", location: "Uttara, Dhaka", monthlyFee: 30, daysPerWeek: 3, description: "Improve grammar, vocabulary, writing and everyday English communication." },
  { title: "HSC Chemistry Complete Course", subject: "Chemistry", classLevel: "HSC", mode: "Online", location: "Zoom", monthlyFee: 35, daysPerWeek: 3, description: "Organic and inorganic chemistry with problem-solving and regular assessments." },
  { title: "ICT and Computer Fundamentals", subject: "ICT", classLevel: "HSC", mode: "Offline", location: "Mirpur, Dhaka", monthlyFee: 28, daysPerWeek: 2, description: "Learn ICT concepts, number systems, databases and basic programming." },
  { title: "O Level Mathematics", subject: "Math", classLevel: "O Level", mode: "Online", location: "Google Meet", monthlyFee: 50, daysPerWeek: 3, description: "Cambridge O Level Mathematics with past paper practice." },
  { title: "SSC General Science", subject: "Science", classLevel: "SSC", mode: "Offline", location: "Rajshahi", monthlyFee: 30, daysPerWeek: 3, description: "Science fundamentals explained with practical examples and revision tests." },
  { title: "Web Development with React", subject: "Programming", classLevel: "University", mode: "Online", location: "Discord + Zoom", monthlyFee: 55, daysPerWeek: 4, description: "Learn HTML, CSS, JavaScript and React through real-world projects." },
  { title: "English for University Admission", subject: "English", classLevel: "University", mode: "Online", location: "Zoom", monthlyFee: 32, daysPerWeek: 3, description: "Admission-focused English grammar, vocabulary and reading comprehension." },
];

async function createDemoUser(userCollection, profile, role) {
  const existing = await userCollection.findOne({ email: profile.email });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: profile.name,
        email: profile.email,
        password: DEMO_PASSWORD,
      },
    });
  }

  await userCollection.updateOne(
    { email: profile.email },
    {
      $set: {
        ...profile,
        role,
        seeded: true,
        // plan shudhu notun user er jonno, pro user abar free hobe na
        ...(existing ? {} : { plan: "free" }),
      },
    }
  );
}

async function seed() {
  try {
    const db = await connectDB();

    const users = db.collection("users");
    const tuitions = db.collection("tuitions");
    const applications = db.collection("applications");
    const payments = db.collection("payments");

    console.log("Starting MentorLagbe Seed V2...");

    await applications.deleteMany({ seeded: true });
    await tuitions.deleteMany({ seeded: true });
    await payments.deleteMany({ seeded: true });

    for (const tutor of tutors) await createDemoUser(users, tutor, "tutor");
    for (const student of students) await createDemoUser(users, student, "student");
    console.log("Demo users created.");

    const tuitionDocs = tuitionTemplates.map((item, index) => {
      const tutor = tutors[index % tutors.length];
      return {
        ...item,
        tutorName: tutor.name,
        tutorEmail: tutor.email,
        bannerImage: img(slug(item.title)),
        approvalStatus: "approved",
        isActive: true,
        seeded: true,
        createdAt: new Date(Date.now() - index * 3600000),
      };
    });

    const allTuitions = [
      ...tuitionDocs,
      ...tuitionDocs.map((item, index) => ({
        ...item,
        title: `${item.title} - Batch 2`,
        bannerImage: img(`${slug(item.title)}-2`),
        tutorEmail: tutors[(index + 2) % tutors.length].email,
        tutorName: tutors[(index + 2) % tutors.length].name,
        createdAt: new Date(Date.now() - (index + 20) * 3600000),
      })),
    ];

    const result = await tuitions.insertMany(allTuitions);
    const tuitionIds = Object.values(result.insertedIds);
    console.log(`Inserted ${tuitionIds.length} tuitions.`);

    const statuses = [
      "accepted", "pending", "pending", "rejected", "accepted", "pending",
      "rejected", "pending", "accepted", "pending", "pending", "rejected",
      "pending", "accepted", "pending", "pending",
    ];

    const applicationDocs = statuses.map((status, index) => {
      const student = students[index % students.length];
      const tuitionIndex = index % tuitionIds.length;
      const tuition = allTuitions[tuitionIndex];

      return {
        tuitionId: tuitionIds[tuitionIndex].toString(),
        tuitionTitle: tuition.title,
        subject: tuition.subject,
        monthlyFee: tuition.monthlyFee,
        tutorEmail: tuition.tutorEmail,
        tutorName: tuition.tutorName,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone,
        preferredSchedule: "Sat, Mon, Wed - 6 PM",
        studentNote:
          "I am interested in this tuition and would like to discuss the learning schedule.",
        status,
        seeded: true,
        appliedAt: new Date(Date.now() - index * 7200000),
      };
    });

    await applications.insertMany(applicationDocs);
    console.log(`Inserted ${applicationDocs.length} applications.`);

    // Sample Stripe payments + pro users
    const proUsers = [
      { ...tutors[0], role: "tutor", planName: "Pro Tutor Plan", amount: 15 },
      { ...students[0], role: "student", planName: "Pro Student Plan", amount: 10 },
    ];

    for (const [i, p] of proUsers.entries()) {
      await users.updateOne({ email: p.email }, { $set: { plan: "pro" } });
      await payments.insertOne({
        userEmail: p.email,
        userName: p.name,
        userRole: p.role,
        planName: p.planName,
        amount: p.amount,
        currency: "usd",
        transactionId: `pi_seed_${i + 1}`,
        stripeSessionId: `cs_seed_${i + 1}`,
        paymentStatus: "paid",
        paidAt: new Date(Date.now() - (i + 1) * 86400000),
        seeded: true,
      });
    }
    console.log(`Inserted ${proUsers.length} payments.`);

    console.log("MentorLagbe Seed V2 completed successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await getClient().close();
  }
}

seed();