import AdminUser from '../models/AdminUser.js';
import axios from 'axios';

const RAG_API_URL = 'http://34.14.43.129/api/v1/data';

// @desc    الحصول على إحصائيات Dashboard
// @route   GET /general/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 جلب عدد المشاريع من صفحة Projects...');
    
    // جلب عدد المشاريع من نفس API الذي تستخدمه صفحة Projects
    let projectsCount = 0;
    let totalDocuments = 0;
    let totalIndexedDocuments = 0;
    let fileTypeDistribution = {};
    let projects = [];
    
    try {
      const projectsResponse = await axios.get(`${RAG_API_URL}/projects`, {
        timeout: 10000
      });
      
      console.log('📡 Raw API Response:', projectsResponse.data);
      
      const projectsData = projectsResponse.data;
      
      // التعامل مع صيغة API الجديدة: {"signal":"PROJECTS_RETRIEVED_SUCCESSFULLY","projects":[...]}
      if (projectsData && projectsData.projects && Array.isArray(projectsData.projects)) {
        projects = projectsData.projects;
        projectsCount = projects.length;
        console.log(`📁 تم العثور على ${projectsCount} مشروع في projects array`);
      } else if (Array.isArray(projectsData)) {
        projects = projectsData;
        projectsCount = projects.length;
        console.log(`📁 تم العثور على ${projectsCount} مشروع في array مباشر`);
      } else {
        console.log('⚠️ صيغة البيانات غير متوقعة:', typeof projectsData);
        projects = [];
        projectsCount = 0;
      }
      
      console.log(`📁 العدد النهائي للمشاريع: ${projectsCount}`);
      
      // الآن جلب ملفات كل مشروع لحساب العدد الكلي للملفات والمفهرسة وأنواع الملفات
      for (const project of projects) {
        try {
          const projectId = project.project_id || project.id;
          console.log(`📄 جلب بيانات المشروع: ${projectId}`);
          
          // جلب الملفات
          const filesResponse = await axios.get(`http://34.14.43.129/api/v1/data/assets/${projectId}`, {
            timeout: 5000
          });
          
          const filesData = filesResponse.data;
          let filesCount = 0;
          
          // التعامل مع صيغة الاستجابة: {"signal":"ASSETS_RETRIEVED_SUCCESSFULLY","assets":[...]}
          if (filesData && filesData.assets && Array.isArray(filesData.assets)) {
            filesCount = filesData.assets.length;
            
            // حساب أنواع الملفات
            filesData.assets.forEach(asset => {
              const fileName = asset.asset_name || asset.name || '';
              const fileType = getFileTypeFromName(fileName);
              fileTypeDistribution[fileType] = (fileTypeDistribution[fileType] || 0) + 1;
            });
            
          } else if (Array.isArray(filesData)) {
            filesCount = filesData.length;
            
            // حساب أنواع الملفات
            filesData.forEach(file => {
              const fileName = file.name || file.filename || '';
              const fileType = getFileTypeFromName(fileName);
              fileTypeDistribution[fileType] = (fileTypeDistribution[fileType] || 0) + 1;
            });
          }
          
          totalDocuments += filesCount;
          console.log(`📄 المشروع ${projectId}: ${filesCount} ملف`);
          
          // جلب معلومات الفهرسة
          try {
            const indexInfoResponse = await axios.get(
              `http://34.14.43.129/api/v1/nlp/index/info/${projectId}`,
              {
                timeout: 5000,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            
            const indexInfo = indexInfoResponse.data;
            const indexedCount = indexInfo?.collection_info?.indexed_vectors_count || 
                               indexInfo?.collection_info?.points_count || 
                               indexInfo?.collection_info?.vectors_count || 0;
            
            totalIndexedDocuments += indexedCount;
            console.log(`🔍 المشروع ${projectId}: ${indexedCount} مستند مفهرس`);
            
          } catch (indexError) {
            console.log(`⚠️ خطأ في جلب معلومات الفهرسة للمشروع ${projectId}:`, indexError.message);
          }
          
        } catch (fileError) {
          console.log(`⚠️ خطأ في جلب ملفات المشروع ${project.project_id || project.id}:`, fileError.message);
        }
      }
      
      console.log(`📄 إجمالي الملفات في جميع المشاريع: ${totalDocuments}`);
      console.log(`🔍 إجمالي الملفات المفهرسة: ${totalIndexedDocuments}`);
      console.log(`📊 توزيع أنواع الملفات:`, fileTypeDistribution);
      
    } catch (apiError) {
      console.log('⚠️ لا يمكن الوصول لـ API Projects:', apiError.message);
      projectsCount = 0;
      totalDocuments = 0;
      totalIndexedDocuments = 0;
      fileTypeDistribution = {};
    }

    // جلب عدد المستخدمين من قاعدة البيانات المحلية
    const totalUsers = await AdminUser.countDocuments();

    // حساب النسبة المئوية للفهرسة بناءً على المشاريع المفهرسة وليس vectors
    let projectsWithIndexing = 0;
    
    // إعادة حساب المشاريع التي بها فهرسة
    for (const project of projects) {
      try {
        const projectId = project.project_id || project.id;
        const indexInfoResponse = await axios.get(
          `http://34.14.43.129/api/v1/nlp/index/info/${projectId}`,
          { timeout: 5000 }
        );
        
        const indexInfo = indexInfoResponse.data;
        const indexedCount = indexInfo?.collection_info?.indexed_vectors_count || 
                           indexInfo?.collection_info?.points_count || 0;
        
        if (indexedCount > 0) {
          projectsWithIndexing++;
        }
      } catch (error) {
        // تجاهل الأخطاء
      }
    }
    
    // حساب النسبة بناءً على المشاريع المفهرسة من إجمالي المشاريع
    const indexingProgress = projectsCount > 0 ? 
      Math.round((projectsWithIndexing / projectsCount) * 100) : 0;

    // حساب النسب المئوية لأنواع الملفات
    const fileTypePercentages = {};
    Object.entries(fileTypeDistribution).forEach(([type, count]) => {
      fileTypePercentages[type] = totalDocuments > 0 ? 
        Math.round((count / totalDocuments) * 100) : 0;
    });

    // إنشاء بيانات المخطط الدائري
    const pieChartData = Object.entries(fileTypeDistribution).map(([type, count]) => ({
      name: getFileTypeLabel(type),
      value: count,
      percentage: totalDocuments > 0 ? Math.round((count / totalDocuments) * 100) : 0
    }));

    const dashboardData = {
      totalProjects: projectsCount,
      totalDocuments: totalDocuments,
      totalIndexedDocuments: totalIndexedDocuments,
      totalUsers: totalUsers,
      activeProjects: projectsCount,
      indexingProgress: indexingProgress,
      fileTypeDistribution: fileTypeDistribution,
      fileTypePercentages: fileTypePercentages,
      averageFilesPerProject: projectsCount > 0 ? Math.round(totalDocuments / projectsCount) : 0,
      systemHealth: indexingProgress > 80 ? 'excellent' : 
                   indexingProgress > 60 ? 'good' : 'needs_attention',
      lastUpdated: new Date().toISOString(),
      pieChartData: pieChartData
    };

    console.log('📊 Dashboard Stats:', {
      'عدد المشاريع': projectsCount,
      'عدد الملفات': totalDocuments,
      'عدد vectors المفهرسة': totalIndexedDocuments,
      'عدد المشاريع المفهرسة': projectsWithIndexing,
      'نسبة المشاريع المفهرسة': `${indexingProgress}%`,
      'متوسط الملفات لكل مشروع': dashboardData.averageFilesPerProject
    });

    res.status(200).json({
      success: true,
      message: `تم جلب ${projectsCount} مشروع، ${totalDocuments} ملف، ${projectsWithIndexing} مشروع مفهرس (${indexingProgress}%)`,
      data: dashboardData,
      isDemoData: false
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات Dashboard:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'خطأ في النظام',
      error: error.message
    });
  }
};

// دالة مساعدة لتحديد نوع الملف من الاسم
function getFileTypeFromName(filename) {
  if (!filename) return 'other';
  
  const extension = filename.toLowerCase().split('.').pop();
  
  const typeMap = {
    'pdf': 'pdf',
    'doc': 'doc',
    'docx': 'docx', 
    'txt': 'txt',
    'md': 'markdown',
    'xls': 'excel',
    'xlsx': 'excel',
    'ppt': 'powerpoint',
    'pptx': 'powerpoint',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image'
  };
  
  return typeMap[extension] || 'other';
}

// دالة مساعدة لتحويل نوع الملف إلى تسمية مفهومة
function getFileTypeLabel(type) {
  const labels = {
    'pdf': 'PDF',
    'doc': 'Word (DOC)',
    'docx': 'Word (DOCX)',
    'txt': 'Text',
    'markdown': 'Markdown',
    'excel': 'Excel',
    'powerpoint': 'PowerPoint',
    'image': 'Images',
    'other': 'Autres'
  };
  
  return labels[type] || type.toUpperCase();
}