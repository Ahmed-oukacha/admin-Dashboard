import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { 
  PlayCircleOutline as PlayCircleOutlineIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import axios from 'axios';

const ProcessOptionsModal = ({ 
  open, 
  onClose, 
  projectId, 
  fileName, 
  onProcessSuccess 
}) => {
  const theme = useTheme();
  
  // États pour les options de traitement
  const [chunkSize, setChunkSize] = useState(512);
  const [overlapSize, setOverlapSize] = useState(50);
  const [doReset, setDoReset] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fonction pour réinitialiser les valeurs par défaut
  const resetForm = () => {
    setChunkSize(512);
    setOverlapSize(50);
    setDoReset(true);
    setIsProcessing(false);
  };

  // Fonction pour fermer la modal
  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  // Fonction pour lancer le traitement
  const handleProcessFile = async () => {
    try {
      setIsProcessing(true);

      const requestBody = {
        file_id: fileName,
        chunk_size: parseInt(chunkSize),
        overlap_size: parseInt(overlapSize),
        do_reset: doReset ? 1 : 0
      };

      console.log('Données envoyées pour le traitement:', requestBody);

      const response = await axios.post(
        `/api/data/process/${projectId}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Réponse du traitement:', response.data);
      
      alert("Le traitement du fichier a été lancé avec succès !");
      
      // Notifier le composant parent que le traitement a réussi
      if (onProcessSuccess) {
        onProcessSuccess(fileName);
      }
      
      handleClose();
      
    } catch (err) {
      console.error('Erreur lors du traitement du fichier:', err);
      alert("Erreur: Impossible de lancer le traitement du fichier.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Validation des champs
  const isFormValid = () => {
    return chunkSize > 0 && overlapSize >= 0 && overlapSize < chunkSize;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <SettingsIcon sx={{ color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h6" component="div">
              Options de Traitement
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fichier: {fileName}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 1 }}>
          {/* Taille des morceaux */}
          <TextField
            label="Taille des morceaux"
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(e.target.value)}
            fullWidth
            inputProps={{ min: 1, max: 2048 }}
            helperText="Taille des segments de texte (entre 1 et 2048)"
            disabled={isProcessing}
          />

          {/* Taille de chevauchement */}
          <TextField
            label="Taille de chevauchement"
            type="number"
            value={overlapSize}
            onChange={(e) => setOverlapSize(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
            helperText="Nombre de caractères de chevauchement entre les segments"
            disabled={isProcessing}
            error={overlapSize >= chunkSize}
          />

          {/* Option de réinitialisation */}
          <FormControlLabel
            control={
              <Switch
                checked={doReset}
                onChange={(e) => setDoReset(e.target.checked)}
                disabled={isProcessing}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  Réinitialiser l'index
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supprimer les données existantes avant le traitement
                </Typography>
              </Box>
            }
          />

          {/* Message d'erreur de validation */}
          {overlapSize >= chunkSize && (
            <Typography variant="body2" color="error">
              La taille de chevauchement doit être inférieure à la taille des morceaux
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          Annuler
        </Button>
        
        <Button
          onClick={handleProcessFile}
          disabled={!isFormValid() || isProcessing}
          variant="contained"
          startIcon={
            isProcessing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayCircleOutlineIcon />
            )
          }
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '&:disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
            }
          }}
        >
          {isProcessing ? 'Traitement en cours...' : 'Lancer le traitement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessOptionsModal;