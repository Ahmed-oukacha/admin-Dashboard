import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  CircularProgress,
  Backdrop,
  useTheme,
} from '@mui/material';
import {
  StorageOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import axios from 'axios';

const IndexingModal = ({ open, onClose, projectId }) => {
  const theme = useTheme();
  const [doReset, setDoReset] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);

  const handleIndexing = async () => {
    try {
      setIsIndexing(true);

      const response = await axios.post(
        `http://194.163.186.182/api/v1/nlp/index/push/${projectId}`,
        {
          do_reset: doReset ? 1 : 0
        }
      );

      // Afficher message de succès
      alert("L'indexation du projet a été terminée avec succès.");
      
      // Fermer la modal
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error);
      alert(`Erreur lors de l'indexation: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleClose = () => {
    if (!isIndexing) {
      setDoReset(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.alt} 100%)`,
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <StorageOutlined 
            sx={{ 
              fontSize: 28,
              color: theme.palette.primary.main 
            }} 
          />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Indexation du Projet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Projet ID: {projectId}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box>
            <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
              Cette opération va indexer tous les fragments textuels (chunks) de ce projet 
              dans la base de données vectorielle Qdrant.
            </Typography>

            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.background.alt,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={doReset}
                    onChange={(e) => setDoReset(e.target.checked)}
                    color="warning"
                    disabled={isIndexing}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Réinitialiser la collection
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Supprimer tous les anciens vecteurs avant l'indexation
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {isIndexing && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: theme.palette.info.main + '10',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.info.main}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <CircularProgress size={20} sx={{ color: theme.palette.info.main }} />
                <Typography variant="body2" color="info.main">
                  Veuillez patienter... L'indexation est en cours.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={isIndexing}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleIndexing}
            disabled={isIndexing}
            variant="contained"
            startIcon={isIndexing ? <CircularProgress size={16} /> : <CheckCircleOutlined />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              }
            }}
          >
            {isIndexing ? 'Indexation...' : 'Lancer l\'indexation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backdrop pour bloquer l'interaction pendant l'indexation */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: theme.zIndex.modal + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={isIndexing}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">
          Indexation en cours...
        </Typography>
        <Typography variant="body2" textAlign="center">
          Cette opération peut prendre plusieurs minutes.
          <br />
          Veuillez ne pas fermer cette fenêtre.
        </Typography>
      </Backdrop>
    </>
  );
};

export default IndexingModal;

